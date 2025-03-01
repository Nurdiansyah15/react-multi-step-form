import { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const checkValidation = () => {
    return (
      Object.values(errors.general).every((val) => val === "") &&
      Object.values(errors.contactAddress).every((val) =>
        Array.isArray(val) ? val.every((v) => v === "") : val === ""
      ) &&
      errors.picList.every((pic) =>
        Object.values(pic).every((val) =>
          Array.isArray(val) ? val.every((v) => v === "") : val === ""
        )
      ) &&
      Object.values(errors.affiliations).every((val) => val === "")
    );
  };

  const [errors, setErrors] = useState({
    general: {
      control: "",
      publisherName: "",
      publisherCode: "",
      IPINumber: "",
    },
    contactAddress: {
      phoneNumber: [""],
      contactName: "",
      email: "",
      website: "",
      correspondenceAddress: "",
      province: "",
      city: "",
      district: "",
      subdistrict: "",
      postalCode: "",
      rt: "",
      rw: "",
    },
    picList: [
      {
        name: "",
        role: "",
        gender: "",
        email: "",
        phoneNumber: [""],
      },
    ],
    affiliations: {
      capacity: "",
      performance: "",
      mechanical: "",
      synchronization: "",
    },
  });

  const [formData, setFormData] = useState({
    general: {
      control: "",
      publisherName: "",
      publisherCode: "",
      IPINumber: "",
    },
    contactAddress: {
      phoneNumber: [""],
      contactName: "",
      email: "",
      website: "",
      correspondenceAddress: "",
      province: "",
      city: "",
      district: "",
      subdistrict: "",
      postalCode: "",
      rt: "",
      rw: "",
    },
    picList: [
      {
        name: "",
        role: "",
        gender: "",
        email: "",
        phoneNumber: [""],
      },
    ],
    affiliations: {
      capacity: "",
      performance: "",
      mechanical: "",
      synchronization: "",
    },
  });

  return (
    <FormContext.Provider
      value={{
        formData,
        setFormData,
        errors,
        setErrors,
        checkValidation,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = () => useContext(FormContext);
