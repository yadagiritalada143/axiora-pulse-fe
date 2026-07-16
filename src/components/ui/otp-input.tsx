import { OTPInput } from 'input-otp';
import type { SlotProps } from 'input-otp';

function Slot(props: SlotProps) {
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-lg border text-lg font-semibold transition-all ${
        props.isActive ? 'border-primary ring-primary/30 ring-2' : 'border-input'
      }`}
    >
      {props.char ?? <span className="text-muted-foreground/50">-</span>}
    </div>
  );
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ value, onChange }: Props) {
  return (
    <OTPInput
      value={value}
      onChange={onChange}
      maxLength={6}
      containerClassName="flex justify-between gap-3"
      render={({ slots }) => (
        <>
          {slots.map((slot, index) => (
            <Slot key={index} {...slot} />
          ))}
        </>
      )}
    />
  );
}
