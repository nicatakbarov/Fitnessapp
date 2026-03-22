import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import ExerciseListBuilder from './ExerciseListBuilder';

const DayBuilder = ({
  weekNumber,
  dayNumber,
  defaultData,
  onSave,
  onClose,
  availableEquipment,
  bilingual
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [dayData, setDayData] = useState(
    defaultData || {
      id: `custom-w${weekNumber}-d${dayNumber}`,
      dayNumber: dayNumber,
      dayName: getDayName(dayNumber),
      title: '',
      warmup: {
        duration: '5 min',
        exercises: []
      },
      mainWorkout: [],
      cooldown: {
        duration: '5 min',
        exercises: []
      }
    }
  );

  function getDayName(dayNum) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNum % 7] || `Day ${dayNum}`;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between bg-zinc-800/50 cursor-pointer hover:bg-zinc-800 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bold text-white">
              {dayData.dayName} - {dayData.title || `Day ${dayNumber}`}
            </h3>
            <p className="text-zinc-400 text-sm">
              {dayData.warmup.exercises.length + dayData.mainWorkout.length + dayData.cooldown.exercises.length} exercises
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-6 space-y-6 border-t border-zinc-800">
          {/* Day Title */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Day Title</Label>
            <Input
              value={dayData.title}
              onChange={(e) => setDayData({ ...dayData, title: e.target.value })}
              placeholder="e.g. Upper Body, Leg Day"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Warmup Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">Warmup</h4>
              <Input
                value={dayData.warmup.duration}
                onChange={(e) => setDayData({
                  ...dayData,
                  warmup: { ...dayData.warmup, duration: e.target.value }
                })}
                placeholder="5 min"
                className="w-24 bg-zinc-800 border-zinc-700 text-white text-sm h-8"
              />
            </div>
            <ExerciseListBuilder
              section="warmup"
              exercises={dayData.warmup.exercises}
              onUpdate={(exercises) => setDayData({
                ...dayData,
                warmup: { ...dayData.warmup, exercises }
              })}
              availableEquipment={availableEquipment}
              bilingual={bilingual}
            />
          </div>

          {/* Main Workout Section */}
          <div className="space-y-3 border-t border-zinc-800 pt-6">
            <h4 className="font-medium text-white">Main Workout</h4>
            <ExerciseListBuilder
              section="mainWorkout"
              exercises={dayData.mainWorkout}
              onUpdate={(exercises) => setDayData({
                ...dayData,
                mainWorkout: exercises
              })}
              availableEquipment={availableEquipment}
              bilingual={bilingual}
            />
          </div>

          {/* Cooldown Section */}
          <div className="space-y-3 border-t border-zinc-800 pt-6">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">Cooldown</h4>
              <Input
                value={dayData.cooldown.duration}
                onChange={(e) => setDayData({
                  ...dayData,
                  cooldown: { ...dayData.cooldown, duration: e.target.value }
                })}
                placeholder="5 min"
                className="w-24 bg-zinc-800 border-zinc-700 text-white text-sm h-8"
              />
            </div>
            <ExerciseListBuilder
              section="cooldown"
              exercises={dayData.cooldown.exercises}
              onUpdate={(exercises) => setDayData({
                ...dayData,
                cooldown: { ...dayData.cooldown, exercises }
              })}
              availableEquipment={availableEquipment}
              bilingual={bilingual}
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-6 border-t border-zinc-800">
            <Button
              onClick={() => onSave(dayData)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              Save Day
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayBuilder;
