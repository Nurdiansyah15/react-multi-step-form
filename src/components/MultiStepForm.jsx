import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";

function MultiStepForm() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="w-[90%]">
      {step === 1 && <Step1 onNext={nextStep} />}
      {step === 2 && <Step2 onBack={prevStep} />}
    </div>
  );
}

export default MultiStepForm;
