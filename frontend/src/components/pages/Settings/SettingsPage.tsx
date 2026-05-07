import React, { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
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
  ChevronRight,
} from 'lucide-react'

interface PushChannel {
  id: string
  name: string
  icon: React.ElementType
  enabled: boolean
  config: Record<string, string>
}

interface NotificationPref {
  id: string
  name: string
  description: string
  enabled: boolean
}

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState({
    nickname: '量化交易者',
    email: 'user@example.com',
    phone: '138****8888',
  })

  const [pushChannels, setPushChannels] = useState<PushChannel[]>([
    {
      id: 'wechat',
      name: '企业微信',
      icon: MessageSquare,
      enabled: true,
      config: { webhook: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/...', agentId: '1000001' },
    },
    {
      id: 'dingtalk',
      name: '钉钉',
      icon: Send,
      enabled: false,
      config: { webhook: '', secret: '' },
    },
    {
      id: 'feishu',
      name: '飞书',
      icon: MessageSquare,
      enabled: false,
      config: { webhook: '' },
    },
    {
      id: 'email',
      name: '邮件',
      icon: Mail,
      enabled: true,
      config: { smtpServer: 'smtp.example.com', port: '587' },
    },
  ])

  const [notifications, setNotifications] = useState<NotificationPref[]>([
    { id: 'signal', name: '交易信号', description: '当产生新的买入/卖出信号时通知', enabled: true },
    { id: 'price_alert', name: '价格预警', description: '股价触及设定的预警价位时通知', enabled: true },
    { id: 'portfolio', name: '持仓变动', description: '持仓盈亏超过设定阈值时通知', enabled: false },
    { id: 'news', name: '重要资讯', description: 'AI识别为高机会评分的新闻推送', enabled: true },
    { id: 'backtest', name: '回测完成', description: '策略回测任务完成时通知', enabled: true },
    { id: 'system', name: '系统公告', description: '平台更新和维护公告', enabled: true },
  ])

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [activeSection, setActiveSection] = useState<'profile' | 'push' | 'notification' | 'theme'>('profile')

  const togglePushChannel = (id: string) => {
    setPushChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    )
  }

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    )
  }

  const sections = [
    { id: 'profile' as const, label: '个人资料', icon: User },
    { id: 'push' as const, label: '推送渠道', icon: Smartphone },
    { id: 'notification' as const, label: '通知偏好', icon: Bell },
    { id: 'theme' as const, label: '外观主题', icon: Monitor },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-bold text-text-primary">系统设置</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-glass-sm text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-accent/20 text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-glass-bg-hover'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">个人资料</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">昵称</label>
                  <GlassInput
                    value={profile.nickname}
                    onChange={(v) => setProfile({ ...profile, nickname: v })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">邮箱</label>
                  <GlassInput
                    type="email"
                    value={profile.email}
                    onChange={(v) => setProfile({ ...profile, email: v })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">手机号</label>
                  <GlassInput
                    value={profile.phone}
                    onChange={(v) => setProfile({ ...profile, phone: v })}
                  />
                </div>
                <div className="pt-4">
                  <GlassButton variant="primary">保存修改</GlassButton>
                </div>
              </div>
            </GlassCard>
          )}

          {activeSection === 'push' && (
            <div className="space-y-4">
              {pushChannels.map((channel) => {
                const Icon = channel.icon
                return (
                  <GlassCard key={channel.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary">{channel.name}</h3>
                          <span className="text-xs text-text-tertiary">
                            {channel.enabled ? '已启用' : '未启用'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePushChannel(channel.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          channel.enabled ? 'bg-accent' : 'bg-glass-bg-hover'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            channel.enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {channel.enabled && (
                      <div className="space-y-3 pt-4 border-t border-glass-border">
                        {Object.entries(channel.config).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-xs text-text-secondary mb-1 capitalize">
                              {key === 'webhook' ? 'Webhook 地址' : key === 'agentId' ? '应用ID' : key === 'secret' ? '密钥' : key === 'smtpServer' ? 'SMTP服务器' : key === 'port' ? '端口' : key}
                            </label>
                            <GlassInput
                              value={value}
                              onChange={(v) => {
                                setPushChannels((prev) =>
                                  prev.map((ch) =>
                                    ch.id === channel.id
                                      ? { ...ch, config: { ...ch.config, [key]: v } }
                                      : ch
                                  )
                                )
                              }}
                              placeholder={`输入${key === 'webhook' ? 'Webhook' : key}...`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                )
              })}
            </div>
          )}

          {activeSection === 'notification' && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">通知偏好</h2>
              <div className="space-y-4">
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
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notification.enabled ? 'bg-accent' : 'bg-glass-bg-hover'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          notification.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeSection === 'theme' && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">外观主题</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-6 rounded-glass-sm border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-accent bg-accent/10'
                      : 'border-glass-border hover:border-glass-border-highlight'
                  }`}
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
                  className={`p-6 rounded-glass-sm border-2 transition-all ${
                    theme === 'light'
                      ? 'border-accent bg-accent/10'
                      : 'border-glass-border hover:border-glass-border-highlight'
                  }`}
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
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
