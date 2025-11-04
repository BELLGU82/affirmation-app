import { useState } from 'react';
import Button from './Button';
import { X, Bell, BellOff } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string;
  newAffirmations: boolean;
  moodTracking: boolean;
  weeklySummary: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminder: true,
  reminderTime: '09:00',
  newAffirmations: true,
  moodTracking: true,
  weeklySummary: false
};

export default function NotificationsModal({ isOpen, onClose, settings, onSave }: NotificationsModalProps) {
  const [editedSettings, setEditedSettings] = useState<NotificationSettings>(settings);

  const handleSave = () => {
    onSave(editedSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell size={20} className="text-indigo-600" />
            Notification Settings
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Daily Reminder */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-1">Daily Reminder</h4>
              <p className="text-sm text-gray-600">Get reminded to practice affirmations daily</p>
            </div>
            <button
              onClick={() => setEditedSettings(prev => ({ ...prev, dailyReminder: !prev.dailyReminder }))}
              className={`relative w-12 h-6 rounded-full transition-colors ml-4 ${
                editedSettings.dailyReminder ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  editedSettings.dailyReminder ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Reminder Time */}
          {editedSettings.dailyReminder && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={editedSettings.reminderTime}
                onChange={(e) => setEditedSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* New Affirmations */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-1">New Affirmations</h4>
              <p className="text-sm text-gray-600">Get notified when new affirmations are generated</p>
            </div>
            <button
              onClick={() => setEditedSettings(prev => ({ ...prev, newAffirmations: !prev.newAffirmations }))}
              className={`relative w-12 h-6 rounded-full transition-colors ml-4 ${
                editedSettings.newAffirmations ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  editedSettings.newAffirmations ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Mood Tracking */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-1">Mood Tracking</h4>
              <p className="text-sm text-gray-600">Reminders to track your mood</p>
            </div>
            <button
              onClick={() => setEditedSettings(prev => ({ ...prev, moodTracking: !prev.moodTracking }))}
              className={`relative w-12 h-6 rounded-full transition-colors ml-4 ${
                editedSettings.moodTracking ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  editedSettings.moodTracking ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Weekly Summary */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-1">Weekly Summary</h4>
              <p className="text-sm text-gray-600">Receive a weekly summary of your progress</p>
            </div>
            <button
              onClick={() => setEditedSettings(prev => ({ ...prev, weeklySummary: !prev.weeklySummary }))}
              className={`relative w-12 h-6 rounded-full transition-colors ml-4 ${
                editedSettings.weeklySummary ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  editedSettings.weeklySummary ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

