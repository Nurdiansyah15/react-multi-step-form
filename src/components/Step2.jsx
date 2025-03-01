import { useState } from "react";
import { useFormData } from "../contexts/FormContext";

function Step2({ onNext, onBack }) {
  const { formData, setFormData, errors, setErrors, checkValidation } =
    useFormData();

  const checkRequiredFieldsFilled = () => {
    const requiredFields = [
      "general.control",
      "general.publisherName",
      "general.publisherCode",
      "general.IPINumber",
      "contactAddress.phoneNumber",
      "contactAddress.contactName",
      "contactAddress.email",
      "contactAddress.website",
      "contactAddress.correspondenceAddress",
      "contactAddress.province",
      "contactAddress.city",
      "contactAddress.district",
      "contactAddress.subdistrict",
      "contactAddress.postalCode",

      // Loop semua PIC
      ...formData.picList.map((_, index) => `picList[${index}].name`),
      ...formData.picList.map((_, index) => `picList[${index}].role`),
      ...formData.picList.map((_, index) => `picList[${index}].gender`),
      ...formData.picList.map((_, index) => `picList[${index}].email`),
      ...formData.picList.map((_, index) => `picList[${index}].phoneNumber`),

      // affiliations
      "affiliations.capacity",
      "affiliations.performance",
      "affiliations.mechanical",
      "affiliations.synchronization",
    ];

    const isFilled = (path) => {
      const keys = path.split(".");
      let value = formData;

      for (let key of keys) {
        if (key.includes("[") && key.includes("]")) {
          // Jika key adalah array, ambil indeks dan properti
          const [arrayKey, index] = key.match(/\w+/g);
          value = value[arrayKey][Number(index)];
        } else {
          value = value[key];
        }

        if (
          value === undefined ||
          value === null ||
          (Array.isArray(value)
            ? value.every((item) => item.toString().trim() === "")
            : value.toString().trim() === "")
        ) {
          return false;
        }
      }
      return true;
    };

    const allRequiredFilled = requiredFields.every(isFilled);

    if (allRequiredFilled) {
      if (checkValidation()) {
        alert("Form submitted! Data: " + JSON.stringify(formData));
      } else {
        alert("Some field is not valid");
      }
    } else {
      alert("Some field is required");
    }
  };

  const handleChange = (section, field, value, index = null, index2 = null) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData };

      if (section === "picList" && field === "phoneNumber" && index2 !== null) {
        updatedData.picList[index].phoneNumber[index2] = value;
      } else if (index !== null) {
        updatedData[section][index] = {
          ...updatedData[section][index],
          [field]: value,
        };
      } else {
        updatedData[section] = {
          ...updatedData[section],
          [field]: value,
        };
      }

      return updatedData;
    });

    // Jalankan validasi
    validateField(section, field, value, index, index2);
  };

  const validateField = (
    section,
    field,
    value,
    index = null,
    index2 = null
  ) => {
    let errorMessage = "";

    if (section === "affiliations") {
      if (field === "capacity") {
        if (!value.trim()) {
          errorMessage = "Capacity name is required";
        }
      } else if (field === "performance") {
        if (!value.trim()) {
          errorMessage = "Performance name is required";
        }
      } else if (field === "mechanical") {
        if (!value.trim()) {
          errorMessage = "Mechanical name is required";
        }
      } else if (field === "synchronization") {
        if (!value.trim()) {
          errorMessage = "Synchronization name is required";
        }
      }
    }

    if (!value.trim() && section === "picList") {
      if (field === "name") errorMessage = "Name is required";
      else if (field === "role") errorMessage = "Role is required";
      else if (field === "gender") errorMessage = "Gender is required";
      else if (field === "email") errorMessage = "Email is required";
    }

    if (field === "name" && value.trim().length < 2) {
      errorMessage = "Name must be at least 2 characters";
    }

    if (field === "email" && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = "Invalid email format";
      }
    }

    if (section === "picList" && field === "phoneNumber" && index2 !== null) {
      if (!value.trim()) {
        errorMessage = "Phone number is required";
      }

      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        const updatedPhoneNumbers = [
          ...updatedErrors.picList[index].phoneNumber,
        ];
        updatedPhoneNumbers[index2] = errorMessage;
        updatedErrors.picList[index].phoneNumber = updatedPhoneNumbers;
        return updatedErrors;
      });

      return; // Stop eksekusi agar tidak override error
    }

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (index !== null) {
        updatedErrors[section][index] = {
          ...updatedErrors[section][index],
          [field]: errorMessage,
        };
      } else {
        updatedErrors[section] = {
          ...updatedErrors[section],
          [field]: errorMessage,
        };
      }
      return updatedErrors;
    });
  };

  const handleAddPic = () => {
    setFormData((prevData) => {
      return {
        ...prevData,
        picList: [
          ...prevData.picList,
          { name: "", role: "", gender: "", email: "", phoneNumber: [] },
        ],
      };
    });
  };

  const handleRemovePic = (index) => {
    setFormData((prevData) => {
      const updatedPicList = prevData.picList.filter((_, i) => i !== index);

      return {
        ...prevData,
        picList: updatedPicList,
      };
    });
  };

  const handleAddPicPhoneNumber = (picIndex) => {
    setFormData((prevData) => {
      const updatedFormData = { ...prevData };
      const updatedPicList = [...updatedFormData.picList];

      // Salin objek pic agar tidak mengubah state langsung
      const updatedPic = { ...updatedPicList[picIndex] };

      // Tambahkan nomor telepon baru
      updatedPic.phoneNumber = [...updatedPic.phoneNumber, ""];

      // Simpan perubahan kembali ke picList
      updatedPicList[picIndex] = updatedPic;
      updatedFormData.picList = updatedPicList;

      return updatedFormData; // Kembalikan data yang sudah diperbarui
    });
  };

  const handleRemovePicPhoneNumber = (picIndex, phoneNumberIndex) => {
    setFormData((prevData) => {
      const updatedFormData = { ...prevData };
      const updatedPicList = [...updatedFormData.picList];

      // Salin data pic agar tidak mengubah state langsung
      const updatedPic = { ...updatedPicList[picIndex] };

      // Hapus nomor telepon berdasarkan index
      updatedPic.phoneNumber = updatedPic.phoneNumber.filter(
        (_, i) => i !== phoneNumberIndex
      );

      // Simpan perubahan kembali ke picList
      updatedPicList[picIndex] = updatedPic;
      updatedFormData.picList = updatedPicList;

      return updatedFormData;
    });

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      const updatedPicErrors = [...updatedErrors.picList];

      // Salin error untuk pic yang sesuai
      const updatedPicError = { ...updatedPicErrors[picIndex] };

      // Hapus error dari nomor telepon yang dihapus
      updatedPicError.phoneNumber = updatedPicError.phoneNumber.filter(
        (_, i) => i !== phoneNumberIndex
      );

      // Simpan perubahan ke error state
      updatedPicErrors[picIndex] = updatedPicError;
      updatedErrors.picList = updatedPicErrors;

      return updatedErrors;
    });
  };

  const onSubmit = () => {
    checkRequiredFieldsFilled();
  };

  console.log(formData);

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-semibold text-center mb-4">
        Create Publisher
      </h1>

      <div className="w-full mx-auto p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-center items-center border-b border-gray-200 h-20">
          {/* Step 1: Publisher Info */}
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={onBack}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-400 text-white font-semibold">
              1
            </div>
            <h2 className="text-lg font-semibold text-gray-500">
              Publisher Info
            </h2>
          </div>

          {/* Garis pemisah */}
          <div className="w-12 h-1 bg-gray-300 mx-4"></div>

          {/* Step 2: PIC & Affiliations (Aktif) */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-900 text-white font-semibold">
              2
            </div>
            <h2 className="text-lg font-semibold">PIC & Affiliations</h2>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom 1: PIC */}
          <div>
            <h3 className="text-lg font-semibold bg-gray-100 px-5 py-2 rounded-md mb-4">
              PIC
            </h3>
            {formData.picList.map((pic, index) => (
              <div
                key={index}
                className="mb-4 border border-gray-300 p-4 rounded-lg"
              >
                <div className="w-full flex justify-between">
                  <h2 className="font-semibold text-lg my-2">
                    {"PIC " + (index + 1)}
                  </h2>
                  <div>
                    {index !== 0 && (
                      <button
                        onClick={() => {
                          handleRemovePic(index);
                        }}
                        className="w-10 h-10 rounded-md bg-gray-200 border border-gray-300 hover:bg-gray-400"
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Name<span className="text-red-500 mx-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={pic.name}
                      placeholder="e.g. Nurdiansyah"
                      onChange={(e) =>
                        handleChange("picList", "name", e.target.value, index)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    />
                    {errors?.picList[index]?.name && (
                      <p className="text-red-500 text-sm">
                        {errors.picList[index].name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Role<span className="text-red-500 mx-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="role"
                      placeholder="e.g. Nurdiansyah"
                      value={pic.role}
                      onChange={(e) =>
                        handleChange("picList", "role", e.target.value, index)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    />
                    {errors?.picList[index]?.role && (
                      <p className="text-red-500 text-sm">
                        {errors.picList[index].role}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Gender<span className="text-red-500 mx-1">*</span>
                    </label>
                    <select
                      name="gender"
                      value={pic.gender}
                      onChange={(e) =>
                        handleChange("picList", "gender", e.target.value, index)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors?.picList[index]?.gender && (
                      <p className="text-red-500 text-sm">
                        {errors.picList[index].gender}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">
                      Email<span className="text-red-500 mx-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. nur@nurd.com"
                      value={pic.email}
                      onChange={(e) =>
                        handleChange("picList", "email", e.target.value, index)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    />
                    {errors?.picList[index]?.email && (
                      <p className="text-red-500 text-sm">
                        {errors.picList[index].email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold">
                    Phone Number<span className="text-red-500 mx-1">*</span>
                  </label>
                  {pic.phoneNumber.map((PN, PNIndex) => (
                    <div key={PNIndex}>
                      <div className="flex gap-2 mb-2 items-center">
                        <span className="px-3 py-2 bg-gray-200 border border-gray-300 rounded-l-lg">
                          +62
                        </span>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={PN}
                          placeholder="e.g. 88382882811"
                          onChange={(e) => {
                            handleChange(
                              "picList",
                              "phoneNumber",
                              e.target.value,
                              index,
                              PNIndex
                            );
                          }}
                          className="w-full border border-gray-300 rounded-r-lg px-3 py-2"
                        />
                        {PNIndex === 0 ? (
                          <button
                            onClick={() => {
                              handleAddPicPhoneNumber(index);
                            }}
                            className="w-10 h-10 rounded-md bg-gray-200 border border-gray-300 hover:bg-gray-400"
                          >
                            +
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleRemovePicPhoneNumber(index, PNIndex);
                            }}
                            className="w-10 h-10 rounded-md bg-gray-200 border border-gray-300 hover:bg-gray-400"
                          >
                            -
                          </button>
                        )}
                      </div>

                      {errors?.picList[index]?.phoneNumber[PNIndex] && (
                        <p className="text-red-500 text-sm">
                          {errors.picList[index].phoneNumber[PNIndex]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleAddPic}
              className="bg-blue-500 w-full text-white px-4 py-2 rounded-lg"
            >
              + Add Another PIC
            </button>
          </div>

          {/* Kolom 2: Affiliations */}
          <div>
            <h3 className="text-lg font-semibold bg-gray-100 px-5 py-2 rounded-md mb-4">
              Affiliations
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="font-semibold">
                  Capacity<span className="text-red-500 mx-1">*</span>
                </label>
                <select
                  name="capacity"
                  value={formData.affiliations?.capacity || ""}
                  onChange={(e) =>
                    handleChange("affiliations", "capacity", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg p-2 w-full"
                >
                  <option value="">Select Capacity</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      Capacity {num}
                    </option>
                  ))}
                </select>
                {errors.affiliations.capacity && (
                  <p className="text-red-500 text-sm">
                    {errors.affiliations.capacity}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="font-semibold">
                  Performance Society Affiliations
                  <span className="text-red-500 mx-1">*</span>
                </label>
                <select
                  name="performance"
                  value={formData.affiliations?.performance || ""}
                  onChange={(e) =>
                    handleChange("affiliations", "performance", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg p-2 w-full"
                >
                  <option value="">Select Performance</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      Perfermance {num}
                    </option>
                  ))}
                </select>
                {errors.affiliations.performance && (
                  <p className="text-red-500 text-sm">
                    {errors.affiliations.performance}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="font-semibold">
                  Mechanical Society Affiliations
                  <span className="text-red-500 mx-1">*</span>
                </label>
                <select
                  name="mechanical"
                  value={formData.affiliations?.mechanical || ""}
                  onChange={(e) =>
                    handleChange("affiliations", "mechanical", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg p-2 w-full"
                >
                  <option value="">Select Mechanical</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      Mechanical {num}
                    </option>
                  ))}
                </select>
                {errors.affiliations.mechanical && (
                  <p className="text-red-500 text-sm">
                    {errors.affiliations.mechanical}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="font-semibold">
                  Synchronization Society Affiliations
                  <span className="text-red-500 mx-1">*</span>
                </label>
                <select
                  name="synchronization"
                  value={formData.affiliations?.synchronization || ""}
                  onChange={(e) =>
                    handleChange(
                      "affiliations",
                      "synchronization",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 rounded-lg p-2 w-full"
                >
                  <option value="">Select Synchronization</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      Synchronization {num}
                    </option>
                  ))}
                </select>
                {errors.affiliations.synchronization && (
                  <p className="text-red-500 text-sm">
                    {errors.affiliations.synchronization}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onBack}
            className="cursor-pointer px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Previous
          </button>
          <button
            onClick={onSubmit}
            className="cursor-pointer px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step2;
