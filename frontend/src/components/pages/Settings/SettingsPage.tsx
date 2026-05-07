import React, { useState, useEffect } from 'react'
import { GlassCard, GlassInput, GlassButton, GlassTabs, GlassBadge } from '@/components/glass'
import { authService } from '@/services/auth'
import { pushService } from '@/services/push'
import { useAuth } from '@/hooks'
import type { PushConfig } from '@/types'
import { cn } from '@/utils/formatters'
import {
  Settings,
  User,
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Check,
  Send,
  Lock,
  Info,
  Shield,
  Database,
  Server,
  Globe,
} from 'lucide-react'

interface NotificationPref {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const sectionTabs = [
  { key: 'profile', label: '个人资料', icon: <User className="w-3.5 h-3.5" /> },
  { key: 'push', label: '推送渠道', icon: <Smartphone className="w-3.5 h-3.5" /> },
  { key: 'notification', label: '通知偏好', icon: <Bell className="w-3.5 h-3.5" /> },
  { key: 'theme', label: '外观主题', icon: <Monitor className="w-3.5 h-3.5" /> },
  { key: 'password', label: '修改密码', icon: <Lock className="w-3.5 h-3.5" /> },
  { key: 'about', label: '关于系统', icon: <Info className="w-3.5 h-3.5" /> },
]

const channelIconMap: Record<string, React.ElementType> = {
  wechat: MessageSquare,
  dingtalk: Send,
  feishu: MessageSquare,
  email: Mail,
}

const channelLabelMap: Record<string, string> = {
  wechat: '企业微信',
  dingtalk: '钉钉',
  feishu: '飞书',
  email: '邮件',
}

const configLabelMap: Record<string, string> = {
  webhook: 'Webhook 地址',
  agentId: '应用ID',
  secret: '密钥',
  smtpServer: 'SMTP服务器',
  port: '端口',
  accessToken: 'Access Token',
}

export const SettingsPage: React.FC = () => {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')

  const [profile, setProfile] = useState({
    nickname: user?.username || '量化交易者',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '138****8888',
  })
  const [profileSaving, setProfileSaving] = useState(false)

  const [pushChannels, setPushChannels] = useState<PushConfig[]>([])
  const [_pushLoading, setPushLoading] = useState(true)

  const [notifications, setNotifications] = useState<NotificationPref[]>([
    { id: 'signal', name: '交易信号', description: '当产生新的买入/卖出信号时通知', enabled: true },
    { id: 'price_alert', name: '价格预警', description: '股价触及设定的预警价位时通知', enabled: true },
    { id: 'portfolio', name: '持仓变动', description: '持仓盈亏超过设定阈值时通知', enabled: false },
    { id: 'news', name: '重要资讯', description: 'AI识别为高机会评分的新闻推送', enabled: true },
    { id: 'backtest', name: '回测完成', description: '策略回测任务完成时通知', enabled: true },
    { id: 'system', name: '系统公告', description: '平台更新和维护公告', enabled: true },
  ])

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const fetchPushConfigs = async () => {
      try {
        const res = await pushService.listConfigs()
        setPushChannels(res.data || [])
      } catch {
        setPushChannels([
          { id: '1', name: '企业微信', type: 'wechat', enabled: true, config: { webhook: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/...', agentId: '1000001' }, events: ['signal', 'price_alert'], userId: '', createdAt: '', updatedAt: '' },
          { id: '2', name: '钉钉', type: 'dingtalk', enabled: false, config: { webhook: '', secret: '' }, events: [], userId: '', createdAt: '', updatedAt: '' },
          { id: '3', name: '飞书', type: 'webhook' as const, enabled: false, config: { webhook: '' }, events: [], userId: '', createdAt: '', updatedAt: '' },
          { id: '4', name: '邮件', type: 'email', enabled: true, config: { smtpServer: 'smtp.example.com', port: '587' }, events: ['news', 'system'], userId: '', createdAt: '', updatedAt: '' },
        ])
      } finally {
        setPushLoading(false)
      }
    }
    fetchPushConfigs()
  }, [])

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    try {
      await authService.updateMe({
        username: profile.nickname,
        email: profile.email,
        phone: profile.phone,
      })
    } catch {
      // ignore
    }
    setProfileSaving(false)
  }

  const togglePushChannel = async (id: string) => {
    const channel = pushChannels.find((c) => c.id === id)
    if (!channel) return
    const newEnabled = !channel.enabled
    setPushChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: newEnabled } : ch))
    )
    try {
      await pushService.updateConfig(id, { enabled: newEnabled })
    } catch {
      setPushChannels((prev) =>
        prev.map((ch) => (ch.id === id ? { ...ch, enabled: !newEnabled } : ch))
      )
    }
  }

  const updatePushConfig = (id: string, key: string, value: string) => {
    setPushChannels((prev) =>
      prev.map((ch) =>
        ch.id === id ? { ...ch, config: { ...ch.config, [key]: value } } : ch
      )
    )
  }

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    )
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('请填写所有密码字段')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的新密码不一致')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('新密码长度不能少于8位')
      return
    }
    setPasswordSaving(true)
    try {
      await authService.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      setPasswordError('密码修改失败，请检查原密码是否正确')
    }
    setPasswordSaving(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-bold text-text-primary">系统设置</h1>
      </div>

      <GlassTabs
        tabs={sectionTabs}
        activeKey={activeSection}
        onChange={setActiveSection}
        size="sm"
      />

      {activeSection === 'profile' && (
        <GlassCard header={<h2 className="text-base font-semibold text-text-primary">个人资料</h2>}>
          <div className="space-y-4">
            <GlassInput
              label="昵称"
              value={profile.nickname}
              onChange={(v) => setProfile({ ...profile, nickname: v })}
            />
            <GlassInput
              label="邮箱"
              type="email"
              value={profile.email}
              onChange={(v) => setProfile({ ...profile, email: v })}
            />
            <GlassInput
              label="手机号"
              value={profile.phone}
              onChange={(v) => setProfile({ ...profile, phone: v })}
            />
            <div className="pt-2">
              <GlassButton variant="primary" loading={profileSaving} onClick={handleSaveProfile}>
                保存修改
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {activeSection === 'push' && (
        <div className="space-y-4">
          {pushChannels.map((channel) => {
            const Icon = channelIconMap[channel.type] || MessageSquare
            return (
              <GlassCard key={channel.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {channel.name || channelLabelMap[channel.type] || channel.type}
                      </h3>
                      <span className="text-xs text-text-tertiary">
                        {channel.enabled ? '已启用' : '未启用'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePushChannel(channel.id)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      channel.enabled ? 'bg-accent' : 'bg-glass-bg-hover'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                        channel.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>

                {channel.enabled && (
                  <div className="space-y-3 pt-4 border-t border-glass-border">
                    {Object.entries(channel.config).map(([key, value]) => (
                      <GlassInput
                        key={key}
                        label={configLabelMap[key] || key}
                        value={String(value)}
                        onChange={(v) => updatePushConfig(channel.id, key, v)}
                        placeholder={`输入${configLabelMap[key] || key}...`}
                      />
                    ))}
                    {channel.events && channel.events.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <span className="text-xs text-text-tertiary">订阅事件:</span>
                        {channel.events.map((evt) => (
                          <GlassBadge key={evt} variant="accent" size="sm">
                            {evt}
                          </GlassBadge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}

      {activeSection === 'notification' && (
        <GlassCard header={<h2 className="text-base font-semibold text-text-primary">通知偏好</h2>}>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-4 bg-glass-bg-hover/20 rounded-glass-sm"
              >
                <div>
                  <h3 className="text-sm font-medium text-text-primary">{notification.name}</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">{notification.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(notification.id)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    notification.enabled ? 'bg-accent' : 'bg-glass-bg-hover'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                      notification.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeSection === 'theme' && (
        <GlassCard header={<h2 className="text-base font-semibold text-text-primary">外观主题</h2>}>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'p-6 rounded-glass-sm border-2 transition-all',
                theme === 'dark'
                  ? 'border-accent bg-accent/10'
                  : 'border-glass-border hover:border-glass-border-highlight'
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <Moon className="w-8 h-8 text-slate-300" />
                </div>
                <span className="text-sm font-medium text-text-primary">深色模式</span>
                {theme === 'dark' && (
                  <div className="flex items-center gap-1 text-accent text-xs">
                    <Check className="w-3 h-3" />
                    当前使用
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={cn(
                'p-6 rounded-glass-sm border-2 transition-all',
                theme === 'light'
                  ? 'border-accent bg-accent/10'
                  : 'border-glass-border hover:border-glass-border-highlight'
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-text-primary">浅色模式</span>
                {theme === 'light' && (
                  <div className="flex items-center gap-1 text-accent text-xs">
                    <Check className="w-3 h-3" />
                    当前使用
                  </div>
                )}
              </div>
            </button>
          </div>
        </GlassCard>
      )}

      {activeSection === 'password' && (
        <GlassCard header={<h2 className="text-base font-semibold text-text-primary">修改密码</h2>}>
          <div className="space-y-4 max-w-md">
            <GlassInput
              label="原密码"
              type="password"
              value={passwordForm.oldPassword}
              onChange={(v) => setPasswordForm({ ...passwordForm, oldPassword: v })}
              placeholder="请输入原密码"
              icon={<Lock className="w-4 h-4" />}
            />
            <GlassInput
              label="新密码"
              type="password"
              value={passwordForm.newPassword}
              onChange={(v) => setPasswordForm({ ...passwordForm, newPassword: v })}
              placeholder="请输入新密码（至少8位）"
              icon={<Shield className="w-4 h-4" />}
            />
            <GlassInput
              label="确认新密码"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(v) => setPasswordForm({ ...passwordForm, confirmPassword: v })}
              placeholder="请再次输入新密码"
              icon={<Shield className="w-4 h-4" />}
              error={passwordError || undefined}
            />
            {passwordError && (
              <p className="text-xs text-down">{passwordError}</p>
            )}
            <div className="pt-2">
              <GlassButton variant="primary" loading={passwordSaving} onClick={handleChangePassword}>
                修改密码
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {activeSection === 'about' && (
        <GlassCard header={<h2 className="text-base font-semibold text-text-primary">关于系统</h2>}>
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-4 p-4 bg-glass-bg-hover/20 rounded-glass-sm">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">QuantVision 量化交易平台</h3>
                <p className="text-xs text-text-tertiary mt-0.5">智能量化投资决策系统</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-glass-sm">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-text-tertiary" />
                  <span className="text-sm text-text-secondary">系统版本</span>
                </div>
                <span className="text-sm font-mono text-text-primary">v2.1.0</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-glass-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-text-tertiary" />
                  <span className="text-sm text-text-secondary">数据版本</span>
                </div>
                <span className="text-sm font-mono text-text-primary">2024.01.16</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-glass-sm">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-text-tertiary" />
                  <span className="text-sm text-text-secondary">服务状态</span>
                </div>
                <GlassBadge variant="up" size="sm" glow>正常运行</GlassBadge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-glass-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-text-tertiary" />
                  <span className="text-sm text-text-secondary">API 版本</span>
                </div>
                <span className="text-sm font-mono text-text-primary">v1.3.2</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-text-tertiary">
              <p>© 2024 QuantVision. All rights reserved.</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}

export default SettingsPage
