import React, { useState } from "react";
import { useFormData } from "../contexts/FormContext";
import axios from "axios";
import Modal from "./Modal";

function Step1({ onNext, onBack }) {
  const { formData, setFormData, errors, setErrors, checkValidation } =
    useFormData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  const onNextHandler = () => {
    checkRequiredFieldsFilled();
  };

  const checkRequiredFieldsFilled = () => {
    const requiredFields = [
      "general.control",
      "general.publisherName",
      "general.publisherCode",
      "contactAddress.phoneNumber",
      "contactAddress.contactName",
      "contactAddress.email",
      "contactAddress.correspondenceAddress",
      "contactAddress.province",
      "contactAddress.city",
      "contactAddress.district",
      "contactAddress.subdistrict",
      "contactAddress.postalCode",
    ];

    const isFilled = (path) => {
      const keys = path.split(".");
      let value = formData;

      for (let key of keys) {
        if (Array.isArray(value[key])) {
          return value[key].every((item) => item.toString().trim() !== "");
        }
        value = value[key];
        if (
          value === undefined ||
          value === null ||
          value.toString().trim() === ""
        ) {
          return false;
        }
      }
      return true;
    };

    const allRequiredFilled = requiredFields.every(isFilled);

    if (!allRequiredFilled) {
      setModalContent({
        title: "Warning!",
        message: "Some fields are required.",
      });
      setIsModalOpen(true);
      return;
    }

    if (!checkValidation()) {
      setModalContent({
        title: "Validation Error",
        message: "Some fields contain invalid data.",
      });
      setIsModalOpen(true);
      return;
    }

    onNext();
  };

  const handleChange = (section, field, value, index = null) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData };

      if (section === "contactAddress") {
        if (field === "province") {
          updatedData.contactAddress.province = value;
          updatedData.contactAddress.city = "";
          updatedData.contactAddress.district = "";
          updatedData.contactAddress.subdistrict = "";
          updatedData.contactAddress.postalCode = "";
        } else if (field === "city") {
          updatedData.contactAddress.city = value;
          updatedData.contactAddress.district = "";
          updatedData.contactAddress.subdistrict = "";
          updatedData.contactAddress.postalCode = "";
        } else if (field === "district") {
          updatedData.contactAddress.district = value;
          updatedData.contactAddress.subdistrict = "";
          updatedData.contactAddress.postalCode = "";
        } else if (field === "subdistrict") {
          updatedData.contactAddress.subdistrict = value;
        }
      }

      if (index !== null) {
        if (section === "contactAddress" && field === "phoneNumber") {
          updatedData.contactAddress.phoneNumber[index] = value;
        } else {
          updatedData[section][index] = {
            ...updatedData[section][index],
            [field]: value,
          };
        }
      } else {
        updatedData[section] = {
          ...updatedData[section],
          [field]: value,
        };
      }

      return updatedData;
    });

    // Jalankan validasi
    validateField(section, field, value, index);
  };

  const validateField = (section, field, value, index = null) => {
    let errorMessage = "";

    if (section === "general") {
      if (field === "control" && !value) {
        errorMessage = "Please select Yes or No";
      } else if (field === "publisherName") {
        if (!value.trim()) {
          errorMessage = "Publisher name is required";
        } else if (value.length < 3) {
          errorMessage = "Minimal 3 characters";
        }
      } else if (field === "publisherCode") {
        if (!value.trim()) {
          errorMessage = "Publisher code is required";
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          errorMessage = "Only alphanumeric characters allowed";
        } else if (value.length > 10) {
          errorMessage = "Maximum 10 characters allowed";
        }
      } else if (field === "IPINumber" && value && !/^\d{11}$/.test(value)) {
        errorMessage = "IPI Number must be exactly 11 digits";
      }
    }

    if (section === "contactAddress") {
      if (field === "contactName") {
        if (!value.trim()) {
          errorMessage = "Contact name is required";
        } else if (value.length < 2) {
          errorMessage = "Minimal 2 characters";
        }
      } else if (field === "email") {
        if (!value.trim()) {
          errorMessage = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Invalid email format";
        }
      } else if (field === "correspondenceAddress") {
        if (!value.trim()) {
          errorMessage = "Correspondence address is required";
        } else if (value.length < 5) {
          errorMessage = "Minimal 5 characters";
        }
      } else if (
        ["province", "city", "district", "subdistrict", "postalCode"].includes(
          field
        ) &&
        !value.trim()
      ) {
        errorMessage = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      } else if (field === "phoneNumber" && !value.trim()) {
        errorMessage = "Phone number is required";
      } else if (field === "rt" || field === "rw") {
        if (value && !/^\d{1,3}$/.test(value)) {
          errorMessage = "Must be numeric and max 3 characters";
        }
      }
    }

    if (field === "phoneNumber") {
      if (!value.trim()) {
        errorMessage = "Phone number is required";
      }

      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        const updatedPhoneNumbers = [
          ...updatedErrors.contactAddress.phoneNumber,
        ];
        updatedPhoneNumbers[index] = errorMessage;
        updatedErrors.contactAddress.phoneNumber = updatedPhoneNumbers;
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

  const handleAddPhoneNumber = () => {
    setFormData((prevData) => ({
      ...prevData,
      contactAddress: {
        ...prevData.contactAddress,
        phoneNumber: [...prevData.contactAddress.phoneNumber, ""],
      },
    }));
  };

  const handleRemovePhoneNumber = (index) => {
    setFormData((prevData) => {
      const updatedPhoneNumbers = prevData.contactAddress.phoneNumber.filter(
        (_, i) => i !== index
      );

      return {
        ...prevData,
        contactAddress: {
          ...prevData.contactAddress,
          phoneNumber: updatedPhoneNumbers,
        },
      };
    });

    setErrors((prevErrors) => {
      const updatedErrors = prevErrors.contactAddress.phoneNumber.filter(
        (_, i) => i !== index
      );

      return {
        ...prevErrors,
        contactAddress: {
          ...prevErrors.contactAddress,
          phoneNumber: updatedErrors,
        },
      };
    });
  };

  const [prov, setProv] = useState([]);
  const [kab, setKab] = useState([]);
  const [kec, setKec] = useState([]);
  const [des, setDes] = useState([]);
  const [pos, setPos] = useState([]);
  // Fetch Provinsi saat komponen dimuat
  React.useEffect(() => {
    axios
      .get("https://alamat.thecloudalert.com/api/provinsi/get/")
      .then((res) => setProv(res.data.result)) // Sesuaikan struktur data API
      .catch((err) => console.error("Error fetching provinces:", err));
  }, []);

  // Fetch Kabupaten/Kota berdasarkan Provinsi yang dipilih
  React.useEffect(() => {
    if (
      !formData.contactAddress.province ||
      formData.contactAddress.province === ""
    ) {
      setKab([]);
      return;
    }
    axios
      .get(
        `https://alamat.thecloudalert.com/api/kabkota/get/?d_provinsi_id=${formData.contactAddress.province}`
      )
      .then((res) => setKab(res.data.result))
      .catch((err) => console.error("Error fetching cities:", err));
  }, [formData.contactAddress.province]);

  // Fetch Kecamatan berdasarkan Kabupaten yang dipilih
  React.useEffect(() => {
    if (!formData.contactAddress.city || formData.contactAddress.city === "") {
      setKec([]);
      return;
    }
    axios
      .get(
        `https://alamat.thecloudalert.com/api/kecamatan/get/?d_kabkota_id=${formData.contactAddress.city}`
      )
      .then((res) => setKec(res.data.result))
      .catch((err) => console.error("Error fetching districts:", err));
  }, [formData.contactAddress.city]);

  // Fetch Kelurahan berdasarkan Kecamatan yang dipilih
  React.useEffect(() => {
    if (
      !formData.contactAddress.district ||
      formData.contactAddress.district === ""
    ) {
      setDes([]);
      return;
    }
    axios
      .get(
        `https://alamat.thecloudalert.com/api/kelurahan/get/?d_kecamatan_id=${formData.contactAddress.district}`
      )
      .then((res) => setDes(res.data.result))
      .catch((err) => console.error("Error fetching districts:", err));
  }, [formData.contactAddress.district]);

  // Fetch Kode Pos berdasarkan Kabupaten & Kecamatan yang dipilih
  React.useEffect(() => {
    if (
      !formData.contactAddress.city ||
      !formData.contactAddress.district ||
      formData.contactAddress.city === "" ||
      formData.contactAddress.district === ""
    ) {
      setPos([]);
      return;
    }
    axios
      .get(
        `https://alamat.thecloudalert.com/api/kodepos/get/?d_kabkota_id=${formData.contactAddress.city}&d_kecamatan_id=${formData.contactAddress.district}`
      )
      .then((res) => {
        setPos(res.data.result);
      })
      .catch((err) => console.error("Error fetching postal code:", err));
  }, [formData.contactAddress.district, formData.contactAddress.city]);

  console.log("formData", formData);

  return (
    <div className="w-full mx-auto p-6">
      {/* Judul di atas card */}
      <h1 className="text-2xl font-semibold text-center mb-4">
        Create Publisher
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Header Navigator */}
        <div className="flex justify-center items-center mb-6 border-b border-gray-200 h-20">
          {/* Step 1: Publisher Info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-900 text-white font-semibold">
              1
            </div>
            <h2 className="text-lg font-semibold">Publisher Info</h2>
          </div>

          {/* Garis pemisah */}
          <div className="w-12 h-1 bg-gray-300 mx-4"></div>

          {/* Step 2: PIC & Affiliations */}
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={onNextHandler}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-400 text-white font-semibold">
              2
            </div>
            <h2 className="text-lg font-semibold text-gray-500">
              PIC & Affiliations
            </h2>
          </div>
        </div>

        {/* General Section */}
        <h3 className="text-lg font-semibold bg-gray-100 px-5 py-2 rounded-md mb-4">
          General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-5">
          {/* Radio Yes/No */}
          <div className="flex flex-col">
            <label className="font-semibold">
              Control<span className="text-red-500 mx-1">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="control"
                  value="Yes"
                  checked={formData.general.control === "Yes"}
                  onChange={(e) =>
                    handleChange("general", "control", e.target.value)
                  }
                  className="mr-2"
                />
                Yes
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="control"
                  value="No"
                  checked={formData.general.control === "No"}
                  onChange={(e) =>
                    handleChange("general", "control", e.target.value)
                  }
                  className="mr-2"
                />
                No
              </label>
            </div>
            {errors.general.control && (
              <p className="text-red-500 text-sm">{errors.general.control}</p>
            )}
          </div>

          {/* Text Inputs */}
          <div className="form-group">
            <label className="font-semibold">
              Publisher Name<span className="text-red-500 mx-1">*</span>
            </label>
            <input
              type="text"
              name="publisherName"
              value={formData.general.publisherName}
              placeholder="e.g. CV Sinar Jaya"
              onChange={(e) =>
                handleChange("general", "publisherName", e.target.value)
              }
              className="border  border-gray-300 rounded-lg p-2 w-full"
            />
            {errors.general.publisherName && (
              <p className="text-red-500 text-sm">
                {errors.general.publisherName}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="font-semibold">
              Publisher Code<span className="text-red-500 mx-1">*</span>
            </label>
            <input
              type="text"
              name="publisherCode"
              value={formData.general.publisherCode}
              placeholder="e.g. ABCD"
              onChange={(e) =>
                handleChange("general", "publisherCode", e.target.value)
              }
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
            {errors.general.publisherCode && (
              <p className="text-red-500 text-sm">
                {errors.general.publisherCode}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="font-semibold">IPI Number</label>
            <input
              type="number"
              name="IPINumber"
              value={formData.general.IPINumber}
              placeholder="Must be 11 digits"
              onChange={(e) =>
                handleChange("general", "IPINumber", e.target.value)
              }
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
            {errors.general.IPINumber && (
              <p className="text-red-500 text-sm">{errors.general.IPINumber}</p>
            )}
          </div>
        </div>

        {/* Contact & Address Section */}
        <h3 className="text-lg font-semibold bg-gray-100 px-5 py-2 rounded-md mb-4">
          Contact & Address
        </h3>

        <div className="grid gap-6">
          {/* Phone Number & Contact Name */}
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-4 flex flex-col">
              <label className="block font-medium">
                Phone Number<span className="text-red-500 mx-1">*</span>
              </label>
              {formData.contactAddress.phoneNumber.map((PN, index) => (
                <div key={index}>
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
                          "contactAddress",
                          "phoneNumber",
                          e.target.value,
                          index
                        );
                      }}
                      className="w-full border border-gray-300 rounded-r-lg px-3 py-2"
                    />
                    {index === 0 ? (
                      <button
                        onClick={handleAddPhoneNumber}
                        className="w-10 h-10 rounded-md bg-gray-200 border border-gray-300 hover:bg-gray-400"
                      >
                        +
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleRemovePhoneNumber(index);
                        }}
                        className="w-10 h-10 rounded-md bg-gray-200 border border-gray-300 hover:bg-gray-400"
                      >
                        -
                      </button>
                    )}
                  </div>

                  {errors.contactAddress.phoneNumber[index] && (
                    <p className="text-red-500 text-sm">
                      {errors.contactAddress.phoneNumber[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="col-span-4 flex flex-col">
              <label className="block font-medium">
                Contact Name<span className="text-red-500 mx-1">*</span>
              </label>
              <input
                type="text"
                name="contactName"
                placeholder="e.g. CV Sinar Jaya"
                value={formData.contactAddress.contactName}
                onChange={(e) =>
                  handleChange("contactAddress", "contactName", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {errors.contactAddress.contactName && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.contactName}
                </p>
              )}
            </div>
          </div>

          {/* Email & Website */}
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-4 flex flex-col">
              <label className="block font-medium">
                Email<span className="text-red-500 mx-1">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.contactAddress.email}
                placeholder="e.g. jaya@jaya.com"
                onChange={(e) =>
                  handleChange("contactAddress", "email", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {errors.contactAddress.email && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.email}
                </p>
              )}
            </div>
            <div className="col-span-4 flex flex-col">
              <label className="block font-medium">Website</label>
              <div className="flex">
                <span className="px-3 py-2 bg-gray-200 border border-gray-300 rounded-l-lg">
                  https://
                </span>
                <input
                  type="text"
                  name="website"
                  value={formData.contactAddress.website.replace(
                    /^https?:\/\//,
                    ""
                  )}
                  placeholder="e.g. example.com"
                  onChange={(e) =>
                    handleChange(
                      "contactAddress",
                      "website",
                      `https://${e.target.value}`
                    )
                  }
                  className="w-full border border-gray-300 rounded-r-lg px-3 py-2"
                />
              </div>
              {errors.contactAddress.website && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.website}
                </p>
              )}
            </div>
          </div>

          {/* Correspondence Address, Province & City */}
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-4 flex flex-col">
              <label className="block font-medium">
                Correspondence Address
                <span className="text-red-500 mx-1">*</span>
              </label>
              <input
                type="text"
                name="correspondenceAddress"
                value={formData.contactAddress.correspondenceAddress}
                placeholder="e.g. Jl. Hambalang"
                onChange={(e) =>
                  handleChange(
                    "contactAddress",
                    "correspondenceAddress",
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {errors.contactAddress.correspondenceAddress && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.correspondenceAddress}
                </p>
              )}
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="block font-medium">
                Province<span className="text-red-500 mx-1">*</span>
              </label>
              <select
                name="province"
                value={formData.contactAddress.province}
                onChange={(e) =>
                  handleChange("contactAddress", "province", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Province</option>
                {prov.map((value, i) => (
                  <option value={value.id} key={i}>
                    {value.text}
                  </option>
                ))}
              </select>
              {errors.contactAddress.province && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.province}
                </p>
              )}
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="block font-medium">
                City<span className="text-red-500 mx-1">*</span>
              </label>
              <select
                name="city"
                value={formData.contactAddress.city}
                onChange={(e) =>
                  handleChange("contactAddress", "city", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select City</option>
                {kab.map((value, i) => (
                  <option value={value.id} key={i}>
                    {value.text}
                  </option>
                ))}
              </select>
              {errors.contactAddress.city && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.city}
                </p>
              )}
            </div>
          </div>

          {/* District, Subdistrict, Postal Code, RT & RW */}
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-2 flex flex-col">
              <label className="block font-medium">
                District<span className="text-red-500 mx-1">*</span>
              </label>
              <select
                name="district"
                value={formData.contactAddress.district}
                onChange={(e) =>
                  handleChange("contactAddress", "district", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select District</option>
                {kec.map((value, i) => (
                  <option value={value.id} key={i}>
                    {value.text}
                  </option>
                ))}
              </select>
              {errors.contactAddress.district && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.district}
                </p>
              )}
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="block font-medium">
                Sub District<span className="text-red-500 mx-1">*</span>
              </label>
              <select
                name="subdistrict"
                value={formData.contactAddress.subdistrict}
                onChange={(e) =>
                  handleChange("contactAddress", "subdistrict", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Sub District</option>
                {des.map((value, i) => (
                  <option value={value.id} key={i}>
                    {value.text}
                  </option>
                ))}
              </select>
              {errors.contactAddress.subdistrict && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.subdistrict}
                </p>
              )}
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="block font-medium">
                Postal Code<span className="text-red-500 mx-1">*</span>
              </label>
              <select
                name="postalCode"
                value={formData.contactAddress.postalCode}
                onChange={(e) =>
                  handleChange("contactAddress", "postalCode", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Postal Code</option>
                {pos.map((value, i) => (
                  <option value={value.id} key={i}>
                    {value.text}
                  </option>
                ))}
              </select>
              {errors.contactAddress.postalCode && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.postalCode}
                </p>
              )}
            </div>

            <div className="col-span-1 flex flex-col">
              <label className="block font-medium">RT</label>
              <input
                type="text"
                name="rt"
                placeholder="e.g. 01"
                value={formData.contactAddress.rt}
                onChange={(e) =>
                  handleChange("contactAddress", "rt", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {errors.contactAddress.rt && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.rt}
                </p>
              )}
            </div>
            <div className="col-span-1 flex flex-col">
              <label className="block font-medium">RW</label>
              <input
                type="text"
                name="rw"
                placeholder="e.g. 02"
                value={formData.contactAddress.rw}
                onChange={(e) =>
                  handleChange("contactAddress", "rw", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {errors.contactAddress.rw && (
                <p className="text-red-500 text-sm">
                  {errors.contactAddress.rw}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 border-t border-gray-200 py-5">
          <button
            onClick={onBack}
            className="cursor-pointer px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Previous
          </button>
          <button
            onClick={onNextHandler}
            className="cursor-pointer px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
          >
            Next
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
}

export default Step1;
