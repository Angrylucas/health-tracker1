import React, { useState, useEffect } from 'react';
import { Activity, Droplet, Thermometer, Moon, Heart, TrendingUp, Calendar, X, Coffee, Wine, Footprints, Scale, Smile, Briefcase, Users, Flame, Zap, Wind, Mountain, Circle, Battery, Brain, Award } from 'lucide-react';

const HealthTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('health-tracker-entries');
        if (result && result.value) {
          setEntries(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No existing data found');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await window.storage.set('health-tracker-entries', JSON.stringify(entries));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    };
    if (entries.length > 0) {
      saveData();
    }
  }, [entries]);

  const activityTypes = {
    sauna: { icon: Thermometer, color: 'bg-orange-500', label: 'Sauna', category: 'wellness' },
    coldPlunge: { icon: Droplet, color: 'bg-blue-500', label: 'Cold Plunge', category: 'wellness' },
    workout: { icon: Activity, color: 'bg-green-500', label: 'Workout', category: 'fitness' },
    steps: { icon: Footprints, color: 'bg-teal-500', label: 'Steps', category: 'fitness' },
    activeCalories: { icon: Flame, color: 'bg-orange-600', label: 'Active Calories', category: 'fitness' },
    totalCalories: { icon: Flame, color: 'bg-red-600', label: 'Total Calories', category: 'fitness' },
    exerciseMinutes: { icon: Zap, color: 'bg-lime-500', label: 'Exercise Minutes', category: 'fitness' },
    standHours: { icon: Circle, color: 'bg-sky-500', label: 'Stand Hours', category: 'fitness' },
    distance: { icon: Mountain, color: 'bg-emerald-600', label: 'Distance', category: 'fitness' },
    sleep: { icon: Moon, color: 'bg-indigo-500', label: 'Sleep', category: 'vitals' },
    heartRate: { icon: Heart, color: 'bg-red-500', label: 'Heart Rate', category: 'vitals' },
    restingHeartRate: { icon: Heart, color: 'bg-pink-500', label: 'Resting HR', category: 'vitals' },
    hrv: { icon: Activity, color: 'bg-purple-600', label: 'HRV', category: 'vitals' },
    bloodOxygen: { icon: Wind, color: 'bg-blue-400', label: 'Blood Oxygen', category: 'vitals' },
    respiratoryRate: { icon: Wind, color: 'bg-cyan-600', label: 'Respiratory Rate', category: 'vitals' },
    vo2Max: { icon: TrendingUp, color: 'bg-green-700', label: 'VO2 Max', category: 'vitals' },
    weight: { icon: Scale, color: 'bg-slate-600', label: 'Weight', category: 'vitals' },
    water: { icon: Droplet, color: 'bg-cyan-500', label: 'Water', category: 'nutrition' },
    coffee: { icon: Coffee, color: 'bg-amber-700', label: 'Coffee', category: 'nutrition' },
    alcohol: { icon: Wine, color: 'bg-purple-500', label: 'Alcohol', category: 'nutrition' },
    mood: { icon: Smile, color: 'bg-yellow-500', label: 'Mood', category: 'mental' },
    mindfulMinutes: { icon: Brain, color: 'bg-violet-500', label: 'Mindful Minutes', category: 'mental' },
    energy: { icon: Battery, color: 'bg-amber-500', label: 'Energy Level', category: 'mental' },
    workHours: { icon: Briefcase, color: 'bg-gray-700', label: 'Work Hours', category: 'productivity' },
    meetings: { icon: Users, color: 'bg-blue-700', label: 'Meetings', category: 'productivity' }
  };

  const calculateWellnessScore = (todayEntries) => {
    let score = 50;
    const breakdown = [];

    const workouts = todayEntries.filter(e => e.type === 'workout');
    if (workouts.length > 0) {
      const bonus = Math.min(workouts.length * 8, 15);
      score += bonus;
      breakdown.push({ factor: 'Workouts', impact: bonus, positive: true });
    }

    const saunas = todayEntries.filter(e => e.type === 'sauna');
    if (saunas.length > 0) {
      const bonus = Math.min(saunas.length * 10, 10);
      score += bonus;
      breakdown.push({ factor: 'Sauna', impact: bonus, positive: true });
    }

    const coldPlunges = todayEntries.filter(e => e.type === 'coldPlunge');
    if (coldPlunges.length > 0) {
      const bonus = Math.min(coldPlunges.length * 10, 10);
      score += bonus;
      breakdown.push({ factor: 'Cold Plunge', impact: bonus, positive: true });
    }

    const steps = todayEntries.filter(e => e.type === 'steps').reduce((s, e) => s + (parseFloat(e.value) || 0), 0);
    if (steps > 0) {
      const bonus = Math.min((steps / 10000) * 10, 10);
      score += bonus;
      breakdown.push({ factor: 'Steps', impact: Math.round(bonus), positive: true });
    }

    const exerciseMin = todayEntries.filter(e => e.type === 'exerciseMinutes').reduce((s, e) => s + (parseFloat(e.value) || 0), 0);
    if (exerciseMin >= 30) {
      const bonus = Math.min((exerciseMin / 30) * 10, 10);
      score += bonus;
      breakdown.push({ factor: 'Exercise', impact: Math.round(bonus), positive: true });
    }

    const sleep = todayEntries.filter(e => e.type === 'sleep');
    if (sleep.length > 0) {
      const hrs = parseFloat(sleep[0].value) || 0;
      if (hrs >= 7 && hrs <= 9) {
        score += 15;
        breakdown.push({ factor: 'Sleep', impact: 15, positive: true });
      } else if (hrs < 6) {
        score -= 10;
        breakdown.push({ factor: 'Poor Sleep', impact: -10, positive: false });
      }
    }

    const water = todayEntries.filter(e => e.type === 'water').reduce((s, e) => s + (parseFloat(e.quantity) || 0), 0);
    if (water >= 2000) {
      const bonus = Math.min((water / 2000) * 8, 8);
      score += bonus;
      breakdown.push({ factor: 'Hydration', impact: Math.round(bonus), positive: true });
    } else if (water > 0 && water < 1000) {
      score -= 5;
      breakdown.push({ factor: 'Low Hydration', impact: -5, positive: false });
    }

    const coffee = todayEntries.filter(e => e.type === 'coffee').reduce((s, e) => s + (parseFloat(e.quantity) || 0), 0);
    if (coffee > 4) {
      score -= 5;
      breakdown.push({ factor: 'Too Much Coffee', impact: -5, positive: false });
    }

    const alcohol = todayEntries.filter(e => e.type === 'alcohol').reduce((s, e) => s + (parseFloat(e.quantity) || 0), 0);
    if (alcohol > 0) {
      const penalty = Math.min(alcohol * 10, 20);
      score -= penalty;
      breakdown.push({ factor: 'Alcohol', impact: -penalty, positive: false });
    }

    const mood = todayEntries.filter(e => e.type === 'mood');
    if (mood.length > 0) {
      const val = mood[0].mood;
      if (val === 'great') {
        score += 10;
        breakdown.push({ factor: 'Great Mood', impact: 10, positive: true });
      } else if (val === 'good') {
        score += 5;
        breakdown.push({ factor: 'Good Mood', impact: 5, positive: true });
      } else if (val === 'low') {
        score -= 5;
        breakdown.push({ factor: 'Low Mood', impact: -5, positive: false });
      } else if (val === 'bad') {
        score -= 10;
        breakdown.push({ factor: 'Bad Mood', impact: -10, positive: false });
      }
    }

    const energy = todayEntries.filter(e => e.type === 'energy');
    if (energy.length > 0) {
      const val = energy[0].energy;
      if (val === 'very-high') {
        score += 8;
        breakdown.push({ factor: 'High Energy', impact: 8, positive: true });
      } else if (val === 'high') {
        score += 5;
        breakdown.push({ factor: 'Good Energy', impact: 5, positive: true });
      } else if (val === 'low') {
        score -= 5;
        breakdown.push({ factor: 'Low Energy', impact: -5, positive: false });
      } else if (val === 'very-low') {
        score -= 8;
        breakdown.push({ factor: 'Very Low Energy', impact: -8, positive: false });
      }
    }

    const mindful = todayEntries.filter(e => e.type === 'mindfulMinutes').reduce((s, e) => s + (parseFloat(e.value) || 0), 0);
    if (mindful >= 10) {
      const bonus = Math.min((mindful / 10) * 8, 8);
      score += bonus;
      breakdown.push({ factor: 'Mindfulness', impact: Math.round(bonus), positive: true });
    }

    const hrv = todayEntries.filter(e => e.type === 'hrv');
    if (hrv.length > 0) {
      const val = parseFloat(hrv[0].value) || 0;
      if (val >= 50) {
        score += 8;
        breakdown.push({ factor: 'Excellent HRV', impact: 8, positive: true });
      } else if (val >= 30) {
        score += 4;
        breakdown.push({ factor: 'Good HRV', impact: 4, positive: true });
      } else if (val < 20) {
        score -= 5;
        breakdown.push({ factor: 'Low HRV', impact: -5, positive: false });
      }
    }

    const workHours = todayEntries.filter(e => e.type === 'workHours').reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
    if (workHours > 8) {
      const penalty = Math.min((workHours - 8) * 2, 15);
      score -= penalty;
      breakdown.push({ factor: 'Long Work Hours', impact: -Math.round(penalty), positive: false });
    }

    const meetings = todayEntries.filter(e => e.type === 'meetings').reduce((s, e) => s + (parseFloat(e.meetingCount) || 0), 0);
    if (meetings > 3) {
      const penalty = Math.min((meetings - 3) * 2, 10);
      score -= penalty;
      breakdown.push({ factor: 'Too Many Meetings', impact: -Math.round(penalty), positive: false });
    }

    const standHours = todayEntries.filter(e => e.type === 'standHours').reduce((s, e) => s + (parseFloat(e.value) || 0), 0);
    if (standHours >= 12) {
      score += 5;
      breakdown.push({ factor: 'Stand Hours', impact: 5, positive: true });
    }

    const bloodOxygen = todayEntries.filter(e => e.type === 'bloodOxygen');
    if (bloodOxygen.length > 0) {
      const val = parseFloat(bloodOxygen[0].value) || 0;
      if (val >= 95) {
        score += 5;
        breakdown.push({ factor: 'Good O2', impact: 5, positive: true });
      } else if (val < 90) {
        score -= 8;
        breakdown.push({ factor: 'Low O2', impact: -8, positive: false });
      }
    }

    score = Math.max(0, Math.min(100, score));
    return { score: Math.round(score), breakdown };
  };

  const ManualEntryForm = ({ type, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      date: new Date().toISOString().slice(0, 16),
      duration: '',
      temperature: '',
      notes: '',
      value: '',
      quantity: '',
      mood: 'neutral',
      energy: 'medium',
      meetingCount: ''
    });

    const handleSubmit = () => {
      const entry = {
        id: Date.now(),
        type,
        timestamp: new Date(formData.date).toISOString(),
        ...formData,
        source: 'manual'
      };
      onSave(entry);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Log {activityTypes[type].label}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {(type === 'sauna' || type === 'coldPlunge' || type === 'workout') && (
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}

            {(type === 'sauna' || type === 'coldPlunge') && (
              <div>
                <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}

            {(type === 'heartRate' || type === 'restingHeartRate') && (
              <div>
                <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}

            {type === 'hrv' && (
              <div>
                <label className="block text-sm font-medium mb-1">HRV (ms)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 45"
                />
              </div>
            )}

            {type === 'bloodOxygen' && (
              <div>
                <label className="block text-sm font-medium mb-1">Blood Oxygen (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 98.5"
                />
              </div>
            )}

            {type === 'respiratoryRate' && (
              <div>
                <label className="block text-sm font-medium mb-1">Breaths per Minute</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 16"
                />
              </div>
            )}

            {type === 'vo2Max' && (
              <div>
                <label className="block text-sm font-medium mb-1">VO2 Max (ml/kg/min)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 42.5"
                />
              </div>
            )}

            {type === 'sleep' && (
              <div>
                <label className="block text-sm font-medium mb-1">Hours Slept</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}

            {type === 'water' && (
              <div>
                <label className="block text-sm font-medium mb-1">Amount (ml)</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 500"
                />
              </div>
            )}

            {type === 'coffee' && (
              <div>
                <label className="block text-sm font-medium mb-1">Cups</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 1.5"
                />
              </div>
            )}

            {type === 'alcohol' && (
              <div>
                <label className="block text-sm font-medium mb-1">Drinks</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 2"
                />
              </div>
            )}

            {type === 'steps' && (
              <div>
                <label className="block text-sm font-medium mb-1">Steps</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 10000"
                />
              </div>
            )}

            {type === 'activeCalories' && (
              <div>
                <label className="block text-sm font-medium mb-1">Active Calories (kcal)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 450"
                />
              </div>
            )}

            {type === 'totalCalories' && (
              <div>
                <label className="block text-sm font-medium mb-1">Total Calories (kcal)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 2200"
                />
              </div>
            )}

            {type === 'exerciseMinutes' && (
              <div>
                <label className="block text-sm font-medium mb-1">Exercise Minutes</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 30"
                />
              </div>
            )}

            {type === 'standHours' && (
              <div>
                <label className="block text-sm font-medium mb-1">Stand Hours</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 12"
                />
              </div>
            )}

            {type === 'distance' && (
              <div>
                <label className="block text-sm font-medium mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 8.5"
                />
              </div>
            )}

            {type === 'weight' && (
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 80.5"
                />
              </div>
            )}

            {type === 'mindfulMinutes' && (
              <div>
                <label className="block text-sm font-medium mb-1">Mindful Minutes</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 10"
                />
              </div>
            )}

            {type === 'mood' && (
              <div>
                <label className="block text-sm font-medium mb-1">How are you feeling?</label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({...formData, mood: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="great">😄 Great</option>
                  <option value="good">🙂 Good</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="low">😕 Low</option>
                  <option value="bad">😢 Bad</option>
                </select>
              </div>
            )}

            {type === 'energy' && (
              <div>
                <label className="block text-sm font-medium mb-1">Energy Level</label>
                <select
                  value={formData.energy}
                  onChange={(e) => setFormData({...formData, energy: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="very-high">⚡ Very High</option>
                  <option value="high">🔋 High</option>
                  <option value="medium">➡️ Medium</option>
                  <option value="low">🔻 Low</option>
                  <option value="very-low">💤 Very Low</option>
                </select>
              </div>
            )}

            {type === 'workHours' && (
              <div>
                <label className="block text-sm font-medium mb-1">Hours Worked</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 8.5"
                />
              </div>
            )}

            {type === 'meetings' && (
              <div>
                <label className="block text-sm font-medium mb-1">Number of Meetings</label>
                <input
                  type="number"
                  value={formData.meetingCount}
                  onChange={(e) => setFormData({...formData, meetingCount: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 5"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows="3"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
              >
                Save Entry
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 rounded py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const addEntry = (entry) => {
    setEntries([entry, ...entries]);
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const getStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntries = entries.filter(e => {
      const entryDate = new Date(e.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    const waterToday = todayEntries.filter(e => e.type === 'water').reduce((sum, e) => sum + (parseFloat(e.quantity) || 0), 0);
    const stepsToday = todayEntries.filter(e => e.type === 'steps').reduce((sum, e) => sum + (parseFloat(e.value) || 0), 0);
    const activeCaloriesToday = todayEntries.filter(e => e.type === 'activeCalories').reduce((sum, e) => sum + (parseFloat(e.value) || 0), 0);
    const exerciseMinutesToday = todayEntries.filter(e => e.type === 'exerciseMinutes').reduce((sum, e) => sum + (parseFloat(e.value) || 0), 0);

    const wellnessScore = calculateWellnessScore(todayEntries);

    return { totalEntries: entries.length, waterToday, stepsToday, activeCaloriesToday, exerciseMinutesToday, wellnessScore };
  };

  const stats = getStats();

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Critical';
  };

  const categories = {
    wellness: ['sauna', 'coldPlunge'],
    fitness: ['workout', 'steps', 'activeCalories', 'totalCalories', 'exerciseMinutes', 'standHours', 'distance'],
    vitals: ['sleep', 'heartRate', 'restingHeartRate', 'hrv', 'bloodOxygen', 'respiratoryRate', 'vo2Max', 'weight'],
    nutrition: ['water', 'coffee', 'alcohol'],
    mental: ['mood', 'mindfulMinutes', 'energy'],
    productivity: ['workHours', 'meetings']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Health Tracker</h1>
          <p className="text-gray-600 text-sm">Track your wellness journey</p>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button onClick={() => setActiveTab('dashboard')} className={`py-3 px-2 border-b-2 font-medium ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              Dashboard
            </button>
            <button onClick={() => setActiveTab('entries')} className={`py-3 px-2 border-b-2 font-medium ${activeTab === 'entries' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              All Entries
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Today's Wellness Score</h2>
                  <p className="text-blue-100 text-sm">Based on all your tracked activities</p>
                </div>
                <Award size={48} className="opacity-80" />
              </div>
              
              <div className="flex items-center gap-8">
                <div className="relative">
                  <svg className="transform -rotate-90" width="160" height="160">
                    <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      stroke="white" 
                      strokeWidth="12" 
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - stats.wellnessScore.score / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold">{stats.wellnessScore.score}</div>
                      <div className="text-sm opacity-90">{getScoreLabel(stats.wellnessScore.score)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold mb-3 text-lg">Score Breakdown</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {stats.wellnessScore.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-white bg-opacity-20 rounded px-3 py-2">
                        <span>{item.factor}</span>
                        <span className={`font-bold ${item.positive ? 'text-green-200' : 'text-red-200'}`}>
                          {item.impact > 0 ? '+' : ''}{item.impact}
                        </span>
                      </div>
                    ))}
                    {stats.wellnessScore.breakdown.length === 0 && (
                      <p className="text-blue-100 text-sm italic">Start tracking activities to see your score breakdown</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Footprints size={20} className="text-teal-600" />
                  <div className="text-2xl font-bold">{stats.stepsToday.toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-600">Steps Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={20} className="text-orange-600" />
                  <div className="text-2xl font-bold">{stats.activeCaloriesToday}</div>
                </div>
                <div className="text-sm text-gray-600">Active Cal Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={20} className="text-lime-600" />
                  <div className="text-2xl font-bold">{stats.exerciseMinutesToday}</div>
                </div>
                <div className="text-sm text-gray-600">Exercise Min Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Droplet size={20} className="text-cyan-600" />
                  <div className="text-2xl font-bold">{Math.round(stats.waterToday)} ml</div>
                </div>
                <div className="text-sm text-gray-600">Water Today</div>
              </div>
            </div>

            {Object.entries(categories).map(([category, types]) => (
              <div key={category} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold mb-4 capitalize">{category}</h2>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                  {types.map(key => {
                    const {icon: Icon, color, label} = activityTypes[key];
                    return (
                      <button key={key} onClick={() => { setModalType(key); setShowModal(true); }} className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition">
                        <div className={`${color} p-2 rounded-full text-white`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
              {entries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="mx-auto mb-2" size={48} />
                  <p>No entries yet. Start tracking!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.slice(0, 10).map(entry => {
                    const {icon: Icon, color, label} = activityTypes[entry.type];
                    return (
                      <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className={`${color} p-2 rounded text-white flex-shrink-0`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-gray-600">{new Date(entry.timestamp).toLocaleString()}</div>
                          {entry.duration && <div className="text-sm text-gray-600">{entry.duration} {entry.type === 'workHours' ? 'hrs' : 'min'}</div>}
                          {entry.value && <div className="text-sm text-gray-600">{entry.value}</div>}
                          {entry.quantity && <div className="text-sm text-gray-600">{entry.quantity}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">All Entries ({entries.length})</h2>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto mb-2" size={48} />
                <p>No entries yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map(entry => {
                  const {icon: Icon, color, label} = activityTypes[entry.type];
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                      <div className={`${color} p-2 rounded text-white flex-shrink-0`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-gray-600">{new Date(entry.timestamp).toLocaleString()}</div>
                        {entry.notes && <div className="text-sm text-gray-600 italic">{entry.notes}</div>}
                      </div>
                      <button onClick={() => deleteEntry(entry.id)} className="text-red-600 hover:text-red-800 p-2 flex-shrink-0">
                        <X size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && <ManualEntryForm type={modalType} onClose={() => setShowModal(false)} onSave={addEntry} />}
    </div>
  );
};

export default HealthTracker;