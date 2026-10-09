import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CoefficientInputProps {
  id: string;
  formula: string;
  value: number;
  onChange: (value: number) => void;
}

export default function CoefficientInput({ id, formula, value, onChange }: CoefficientInputProps) {
  return (
    <div className="flex min-w-[7rem] flex-1 items-end gap-2">
      <div className="flex-1">
        <Label htmlFor={id} className="sr-only">
          Koeffizient für {formula}
        </Label>
        <Input
          id={id}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
          className="text-center font-mono text-lg"
          aria-describedby={`${id}-help`}
        />
        <span id={`${id}-help`} className="sr-only">
          Ganze Zahl größer oder gleich eins
        </span>
      </div>
      <span className="pb-2 font-mono text-lg" aria-hidden="true">
        {formula}
      </span>
    </div>
  );
}
