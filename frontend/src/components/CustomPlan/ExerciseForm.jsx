import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { EQUIPMENT_DB } from '../../data/programs';

const ExerciseForm = ({
  exercise,
  availableEquipment,
  onSave,
  onCancel,
  bilingual
}) => {
  const [formData, setFormData] = useState(
    exercise || {
      name: '',
      equipment: 'bodyweight',
      sets: 3,
      reps: 12,
      weight: '',
      rest: '60 sec',
      tip: '',
      alternatives: []
    }
  );

  const [errors, setErrors] = useState({});
  const [showAlternativeForm, setShowAlternativeForm] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Exercise name required';
    if (!formData.equipment) newErrors.equipment = 'Equipment required';
    if (!formData.rest.trim()) newErrors.rest = 'Rest period required';
    if (!formData.reps && !formData.duration) {
      newErrors.reps = 'Sets/Reps or Duration required';
    }

    // Check for duplicate equipment in alternatives
    const equipmentUsed = [formData.equipment];
    for (const alt of formData.alternatives || []) {
      if (equipmentUsed.includes(alt.equipment)) {
        newErrors.alternatives = 'Duplicate equipment in alternatives';
        break;
      }
      equipmentUsed.push(alt.equipment);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleAddAlternative = (altData) => {
    setFormData({
      ...formData,
      alternatives: [...(formData.alternatives || []), altData]
    });
    setShowAlternativeForm(false);
  };

  const handleRemoveAlternative = (index) => {
    setFormData({
      ...formData,
      alternatives: formData.alternatives.filter((_, i) => i !== index)
    });
  };

  const equipmentOptions = availableEquipment.length > 0
    ? availableEquipment
    : EQUIPMENT_DB.map(e => e.key);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-white">
          {exercise ? 'Edit Exercise' : 'Add Exercise'}
        </h3>
        <button
          onClick={onCancel}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Exercise Name */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Exercise Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Push-up, Dumbbell Row"
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
      </div>

      {/* Equipment */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Equipment *</Label>
        <select
          value={formData.equipment}
          onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2"
        >
          {equipmentOptions.map(equipKey => {
            const equipItem = EQUIPMENT_DB.find(e => e.key === equipKey);
            return (
              <option key={equipKey} value={equipKey}>
                {equipItem?.en || equipKey} ({equipItem?.emoji})
              </option>
            );
          })}
        </select>
        {errors.equipment && <p className="text-red-400 text-sm">{errors.equipment}</p>}
      </div>

      {/* Sets & Reps */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-zinc-300">Sets</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={formData.sets || ''}
            onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || '' })}
            placeholder="3"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300">Reps *</Label>
          <Input
            value={formData.reps || ''}
            onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
            placeholder="12, 10-12, to failure"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          {errors.reps && <p className="text-red-400 text-sm">{errors.reps}</p>}
        </div>
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Starting Weight (Optional)</Label>
        <Input
          value={formData.weight || ''}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          placeholder="e.g. 20 kg, 40 lbs, bodyweight"
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      {/* Rest */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Rest Period *</Label>
        <Input
          value={formData.rest}
          onChange={(e) => setFormData({ ...formData, rest: e.target.value })}
          placeholder="60 sec, 2 min"
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        {errors.rest && <p className="text-red-400 text-sm">{errors.rest}</p>}
      </div>

      {/* Tip */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Form Tip (Optional)</Label>
        <textarea
          value={formData.tip || ''}
          onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
          placeholder="e.g. Keep body straight, squeeze at the top"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm"
          rows="2"
        />
      </div>

      {/* Alternatives */}
      <div className="border-t border-zinc-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white">Equipment Alternatives</h4>
          {!showAlternativeForm && (
            <Button
              onClick={() => setShowAlternativeForm(true)}
              size="sm"
              className="bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Alternative
            </Button>
          )}
        </div>

        {errors.alternatives && (
          <p className="text-red-400 text-sm mb-2">{errors.alternatives}</p>
        )}

        {/* Alternative Items */}
        <div className="space-y-2 mb-3">
          {(formData.alternatives || []).map((alt, idx) => (
            <div key={idx} className="bg-zinc-800 p-3 rounded-lg flex items-center justify-between">
              <div className="text-sm">
                <p className="text-white font-medium">{alt.name}</p>
                <p className="text-zinc-400 text-xs">
                  {EQUIPMENT_DB.find(e => e.key === alt.equipment)?.az || alt.equipment}
                  ({alt.sets}x{alt.reps})
                </p>
              </div>
              <button
                onClick={() => handleRemoveAlternative(idx)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Alternative Form */}
        {showAlternativeForm && (
          <AlternativeExerciseForm
            mainEquipment={formData.equipment}
            availableEquipment={availableEquipment}
            onSave={handleAddAlternative}
            onCancel={() => setShowAlternativeForm(false)}
          />
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          {exercise ? 'Update' : 'Add'} Exercise
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Sub-component for alternative exercise
const AlternativeExerciseForm = ({
  mainEquipment,
  availableEquipment,
  onSave,
  onCancel
}) => {
  const [altData, setAltData] = useState({
    name: '',
    equipment: '',
    sets: 3,
    reps: 12,
    rest: '60 sec',
    tip: ''
  });

  const equipmentOptions = availableEquipment.length > 0
    ? availableEquipment
    : EQUIPMENT_DB.map(e => e.key);

  return (
    <div className="bg-zinc-800 p-3 rounded-lg space-y-3 text-sm">
      <Input
        value={altData.name}
        onChange={(e) => setAltData({ ...altData, name: e.target.value })}
        placeholder="Alternative exercise name"
        className="bg-zinc-700 border-zinc-600 text-white text-sm h-8"
      />

      <select
        value={altData.equipment}
        onChange={(e) => setAltData({ ...altData, equipment: e.target.value })}
        className="w-full bg-zinc-700 border border-zinc-600 text-white rounded text-sm px-2 py-1"
      >
        <option value="">Select equipment</option>
        {equipmentOptions.filter(e => e !== mainEquipment).map(equipKey => {
          const equipItem = EQUIPMENT_DB.find(eq => eq.key === equipKey);
          return (
            <option key={equipKey} value={equipKey}>
              {equipItem?.en || equipKey}
            </option>
          );
        })}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          min="1"
          max="10"
          value={altData.sets}
          onChange={(e) => setAltData({ ...altData, sets: parseInt(e.target.value) || 3 })}
          placeholder="Sets"
          className="bg-zinc-700 border-zinc-600 text-white text-sm h-8"
        />
        <Input
          value={altData.reps}
          onChange={(e) => setAltData({ ...altData, reps: e.target.value })}
          placeholder="Reps"
          className="bg-zinc-700 border-zinc-600 text-white text-sm h-8"
        />
      </div>

      <Input
        value={altData.rest}
        onChange={(e) => setAltData({ ...altData, rest: e.target.value })}
        placeholder="Rest"
        className="bg-zinc-700 border-zinc-600 text-white text-sm h-8"
      />

      <div className="flex gap-2">
        <Button
          onClick={() => onSave(altData)}
          disabled={!altData.name || !altData.equipment}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-7"
        >
          Add
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="border-zinc-600 text-zinc-400 hover:bg-zinc-700 text-xs h-7"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ExerciseForm;
