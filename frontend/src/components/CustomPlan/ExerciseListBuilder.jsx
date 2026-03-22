import { useState } from 'react';
import { Plus, X, GripVertical, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import ExerciseForm from './ExerciseForm';
import { EQUIPMENT_DB } from '../../data/programs';

const ExerciseListBuilder = ({
  section,
  exercises,
  onUpdate,
  availableEquipment,
  bilingual
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const sectionLabels = {
    warmup: { az: 'İsınma', en: 'Warmup' },
    mainWorkout: { az: 'Əsas Məşqlər', en: 'Main Workout' },
    cooldown: { az: 'Soyutma', en: 'Cooldown' }
  };

  const handleAddExercise = (exerciseData) => {
    const newExercises = [...exercises, exerciseData];
    onUpdate(newExercises);
    setShowForm(false);
  };

  const handleEditExercise = (exerciseData) => {
    const newExercises = [...exercises];
    newExercises[editingIndex] = exerciseData;
    onUpdate(newExercises);
    setEditingIndex(null);
  };

  const handleDeleteExercise = (index) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    onUpdate(newExercises);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newExercises = [...exercises];
    [newExercises[index], newExercises[index - 1]] = [newExercises[index - 1], newExercises[index]];
    onUpdate(newExercises);
  };

  const handleMoveDown = (index) => {
    if (index === exercises.length - 1) return;
    const newExercises = [...exercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    onUpdate(newExercises);
  };

  const label = sectionLabels[section];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">
          {bilingual ? label.az : label.en}
        </h4>
        {!showForm && editingIndex === null && (
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="bg-zinc-700 hover:bg-zinc-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {exercises.map((exercise, idx) => (
          <div
            key={idx}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3"
          >
            {/* Drag Handle */}
            <div className="flex gap-1">
              <button
                onClick={() => handleMoveUp(idx)}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                disabled={idx === 0}
                title="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => handleMoveDown(idx)}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                disabled={idx === exercises.length - 1}
                title="Move down"
              >
                ▼
              </button>
            </div>

            {/* Exercise Info */}
            <div className="flex-1">
              <p className="text-white font-medium">{exercise.name}</p>
              <p className="text-zinc-400 text-sm">
                {EQUIPMENT_DB.find(e => e.key === exercise.equipment)?.emoji}{' '}
                {exercise.sets}x{exercise.reps} • {exercise.rest}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingIndex(idx)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteExercise(idx)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      {showForm && (
        <ExerciseForm
          availableEquipment={availableEquipment}
          onSave={handleAddExercise}
          onCancel={() => setShowForm(false)}
          bilingual={bilingual}
        />
      )}

      {editingIndex !== null && (
        <ExerciseForm
          exercise={exercises[editingIndex]}
          availableEquipment={availableEquipment}
          onSave={handleEditExercise}
          onCancel={() => setEditingIndex(null)}
          bilingual={bilingual}
        />
      )}

      {/* Empty State */}
      {exercises.length === 0 && !showForm && editingIndex === null && (
        <p className="text-zinc-500 text-sm italic">No exercises yet. Click "Add" to get started.</p>
      )}
    </div>
  );
};

export default ExerciseListBuilder;
