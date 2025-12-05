import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { EyeCloseIcon, EyeIcon } from "../../../icons";
import DatePicker from "../date-picker.tsx";
import {useDropzone} from "react-dropzone";
import PhoneInput from "../group-input/PhoneInput.tsx";

export default function UserInputs() {
  const [showPassword, setShowPassword] = useState(false);
  const options = [
    { value: "driver", label: "Conducteur" },
    { value: "admin", label: "Admin" }
  ];
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  const onDrop = (acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    // Handle file uploads here
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const countries = [
    { code: "TG", label: "+228" },
    { code: "BJ", label: "+229" },
    { code: "GH", label: "+33" },
  ];
  const handlePhoneNumberChange = (phoneNumber: string) => {
    console.log("Updated phone number:", phoneNumber);
  };

  return (
    <ComponentCard title="Veuillez remplir ce formulaire">
      <div className="space-y-6">
        <div>
          <Label htmlFor="inputTwo">Nom </Label>
          <Input type="text" id="inputTwo" placeholder="Nom de l'utilisateur" />
        </div>
        <div>
          <Label htmlFor="inputTwo">Prénoms </Label>
          <Input type="text" id="inputTwo" placeholder="Prénoms de l'utilisateur" />
        </div>
        <div>
          <Label>Type d'utilisateur</Label>
          <Select
            options={options}
            placeholder="Selectionner une option"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>
        <div>
          <Label>Numero de téléphone</Label>
          <PhoneInput
              selectPosition="start"
              countries={countries}
              placeholder="+228 00 00 00 00"
              onChange={handlePhoneNumberChange}
          />
        </div>{" "}
        <div>
          <Label>Définir un mot de passe</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Entrer un mot de passe"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="inputTwo">Numero de la piece d'identité </Label>
          <Input type="text" id="inputTwo" placeholder="Numero de la piece d'identité de l'utilisateur" />
        </div>
        <div>
          <DatePicker
            id="date-picker"
            label="Fait le"
            placeholder="Choichir la date"
            onChange={(dates, currentDateString) => {
              // Handle your logic
              console.log({ dates, currentDateString });
            }}
          />
        </div>

        <div>
          <form
              {...getRootProps()}
              className={`dropzone rounded-xl   border-dashed border-gray-300 p-7 lg:p-10
        ${
                  isDragActive
                      ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                      : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              }
      `}
              id="demo-upload"
          >
            {/* Hidden Input */}
            <input {...getInputProps()} />

            <div className="dz-message flex flex-col items-center m-0!">
              {/* Icon Container */}
              <div className="mb-[22px] flex justify-center">
                <div className="flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <svg
                      className="fill-current"
                      width="29"
                      height="28"
                      viewBox="0 0 29 28"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                    />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                {isDragActive ? "Déposer la photo ici" : "Glisser & Déposer la photo de la pièce d'identité ici"}
              </h4>

              <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
              Formats pris en charge: PNG, JPG, WebP, SVG ou Naviguer vers le repertoire
            </span>

              <span className="font-medium underline text-theme-sm text-brand-500">
              Naviguer vers le repertoire
            </span>
            </div>
          </form>
        </div>

      </div>
    </ComponentCard>
  );
}
