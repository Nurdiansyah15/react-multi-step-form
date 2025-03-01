import { useState } from "react";
import MultiStepForm from "./components/MultiStepForm";
import { FormProvider } from "./contexts/FormContext";

function App() {
  return (
    <>
      <FormProvider>
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <MultiStepForm />
        </div>
      </FormProvider>
    </>
  );
}

export default App;
