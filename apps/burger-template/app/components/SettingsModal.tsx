"use client";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SupabaseSettings {
  url: string;
  anonKey: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<SupabaseSettings>({
    url: "",
    anonKey: ""
  });
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem("supabase-settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        } catch (error) {
          console.error("Failed to parse saved settings:", error);
        }
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("supabase-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings({ url: "", anonKey: "" });
    localStorage.removeItem("supabase-settings");
  };

  const handleCopyToEnv = () => {
    const envContent = `NEXT_PUBLIC_SUPABASE_URL=${settings.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${settings.anonKey}`;
    
    navigator.clipboard.writeText(envContent).then(() => {
      alert("环境变量已复制到剪贴板！请粘贴到 .env.local 文件中。");
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = envContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("环境变量已复制到剪贴板！请粘贴到 .env.local 文件中。");
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 settings-modal">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-burger-yellow to-burger-red p-6 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-xl font-bold">设置</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label="关闭设置"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Supabase Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🔧</span>
              Supabase 配置
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supabase URL
                </label>
                <input
                  type="url"
                  value={settings.url}
                  onChange={(e) => setSettings(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-project-ref.supabase.co"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burger-yellow focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anon Key
                </label>
                <input
                  type="text"
                  value={settings.anonKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, anonKey: e.target.value }))}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burger-yellow focus:border-transparent"
                />
              </div>
            </div>

            {/* Save Status */}
            {saved && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm">
                ✅ 设置已保存！
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSave}
                className="w-full bg-burger-red hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                保存设置
              </button>
              
              <button
                onClick={handleCopyToEnv}
                disabled={!settings.url || !settings.anonKey}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                复制到 .env.local
              </button>
              
              <button
                onClick={handleReset}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                重置设置
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📝 使用说明</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 从 Supabase 控制台获取 URL 和 Anon Key</li>
              <li>• 点击"复制到 .env.local"按钮</li>
              <li>• 将内容粘贴到项目的 .env.local 文件中</li>
              <li>• 重启开发服务器以使更改生效</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}