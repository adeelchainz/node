"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { z } from "zod";

// Dynamically import Confetti to avoid SSR issues
const ReactConfetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

// Define the schema for form validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(
    ["Designer", "Developer", "Product Manager", "Founder", "Other"],
    {
      errorMap: () => ({ message: "Please select a role" }),
    }
  ),
  experience: z.enum(
    ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
    {
      errorMap: () => ({ message: "Please select your experience level" }),
    }
  ),
  goals: z
    .string()
    .min(10, "Please describe your goals in at least 10 characters"),
  interests: z
    .array(
      z.enum(["Design", "Development", "Marketing", "Analytics", "Business"])
    )
    .min(1, "Please select at least one interest"),
});

// Define the form data type based on the schema
type FormData = z.infer<typeof formSchema>;

// Define the types for validation errors
type ValidationErrors = {
  [K in keyof FormData]?: string;
};

// Define the role and experience types
type Role = FormData["role"];
type Experience = FormData["experience"];
type Interest =
  | "Design"
  | "Development"
  | "Marketing"
  | "Analytics"
  | "Business";

// This union type covers all possible onChange event types we'll need
type OnChangeHandler =
  | ((e: React.ChangeEvent<HTMLInputElement>) => void)
  | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void)
  | ((value: string) => void);

// Question type
interface Question {
  id: keyof FormData;
  question: string;
  type: "text" | "radio" | "textarea" | "checkbox";
  placeholder?: string;
  options?: string[];
  value: string | string[];
  onChange: OnChangeHandler;
  validate: () => string | undefined;
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(-1); // Start at -1 for welcome screen
  const [formData, setFormData] = useState<FormData>({
    name: "",
    role: "" as Role,
    experience: "" as Experience,
    goals: "",
    interests: [],
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateField = (field: keyof FormData): string | undefined => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = z.object({ [field]: formSchema.shape[field] });
      fieldSchema.parse({ [field]: formData[field] });
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find((e) => e.path[0] === field);
        return fieldError?.message;
      }
      return "Invalid input";
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentQuestion = questions[step];
    const error = currentQuestion.validate();

    if (error) {
      setValidationErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: error,
      }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      if (validateCurrentStep()) {
        setStep(step + 1);
      }
    } else {
      // Validate all fields before submission
      const validationResult = validateAllFields();
      if (validationResult.valid) {
        handleSubmit();
      }
    }
  };

  const validateAllFields = () => {
    const errors: ValidationErrors = {};
    let valid = true;

    for (const field of Object.keys(formSchema.shape) as Array<
      keyof FormData
    >) {
      const error = validateField(field);
      if (error) {
        errors[field] = error;
        valid = false;
      }
    }

    setValidationErrors(errors);
    return { valid, errors };
  };

  const handlePrevious = () => {
    if (step > -1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate the form data against the schema
      formSchema.parse(formData);

      // If validation passes, proceed with submission
      // const result = await submitForm(formData)
      // if (result.success) {
      setIsComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
      toast.success("Success!", {
        description: "Your information has been submitted successfully.",
      });
      // }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setValidationErrors(newErrors);

        toast.error("Validation Error", {
          description: "Please fix the errors in the form before submitting.",
        });
      } else {
        toast.error("Error", {
          description:
            "There was a problem submitting your information. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define type guard functions for checking handler types
  function isTextInputHandler(
    fn: OnChangeHandler
  ): fn is (e: React.ChangeEvent<HTMLInputElement>) => void {
    return true; // Runtime check isn't needed as we use this for typecasting
  }

  function isTextAreaHandler(
    fn: OnChangeHandler
  ): fn is (e: React.ChangeEvent<HTMLTextAreaElement>) => void {
    return true; // Runtime check isn't needed as we use this for typecasting
  }

  const questions: Question[] = [
    {
      id: "name",
      question: "What's your name?",
      type: "text",
      placeholder: "Enter your full name",
      value: formData.name,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        updateFormData("name", e.target.value),
      validate: () => validateField("name"),
    },
    {
      id: "role",
      question: "What best describes your role?",
      type: "radio",
      options: ["Designer", "Developer", "Product Manager", "Founder", "Other"],
      value: formData.role,
      onChange: (value: string) => updateFormData("role", value as Role),
      validate: () => validateField("role"),
    },
    {
      id: "experience",
      question: "How many years of experience do you have?",
      type: "radio",
      options: [
        "Less than 1 year",
        "1-3 years",
        "3-5 years",
        "5-10 years",
        "10+ years",
      ],
      value: formData.experience,
      onChange: (value: string) =>
        updateFormData("experience", value as Experience),
      validate: () => validateField("experience"),
    },
    {
      id: "goals",
      question: "What are you hoping to achieve?",
      type: "textarea",
      placeholder: "Tell us about your goals...",
      value: formData.goals,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        updateFormData("goals", e.target.value),
      validate: () => validateField("goals"),
    },
    {
      id: "interests",
      question: "What are you interested in?",
      type: "checkbox",
      options: ["Design", "Development", "Marketing", "Analytics", "Business"],
      value: formData.interests,
      onChange: (value: string) => {
        const interests = [...formData.interests];
        if (interests.includes(value as Interest)) {
          updateFormData(
            "interests",
            interests.filter((i) => i !== value)
          );
        } else {
          updateFormData("interests", [...interests, value as Interest]);
        }
      },
      validate: () => validateField("interests"),
    },
  ];

  const currentQuestion = step >= 0 ? questions[step] : null;
  const progress = step >= 0 ? ((step + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && (
        <ReactConfetti
          width={typeof window !== "undefined" ? window.innerWidth : 1000}
          height={typeof window !== "undefined" ? window.innerHeight : 1000}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Background details */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gray-100 dark:bg-gray-900 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gray-100 dark:bg-gray-900 translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-900" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-gray-100 dark:bg-gray-900" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(156,163,175,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(156,163,175,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Progress bar - only show when not on welcome or completion screen */}
      {step >= 0 && !isComplete && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-10">
          <motion.div
            className="h-full bg-gray-800 dark:bg-gray-200"
            initial={{ width: `${(step / questions.length) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {step === -1 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-3xl px-6 py-12 mx-auto relative z-10 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-6xl font-light mb-6 text-gray-900 dark:text-gray-50">
                Welcome
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                We&apos;re excited to have you here. Let&apos;s get to know you
                better to personalize your experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button
                onClick={() => setStep(0)}
                className="px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 rounded-full"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Questions */}
        {step >= 0 && !isComplete && currentQuestion && (
          <motion.div
            key={`question-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-3xl px-6 py-12 mx-auto relative z-10"
          >
            <div className="space-y-12">
              <motion.h1
                className="text-4xl md:text-5xl font-light text-center text-gray-900 dark:text-gray-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                {currentQuestion.question}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="max-w-xl mx-auto"
              >
                {currentQuestion.type === "text" && (
                  <div className="space-y-2">
                    <Input
                      id={currentQuestion.id}
                      placeholder={currentQuestion.placeholder}
                      value={currentQuestion.value as string}
                      onChange={
                        isTextInputHandler(currentQuestion.onChange)
                          ? currentQuestion.onChange
                          : undefined
                      }
                      className={`text-lg py-6 px-4 border-0 border-b-2 ${
                        validationErrors[currentQuestion.id]
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-200 dark:border-gray-800"
                      } rounded-none focus:ring-0 focus:border-gray-900 dark:focus:border-gray-100 bg-transparent`}
                    />
                    {validationErrors[currentQuestion.id] && (
                      <div className="text-red-500 flex items-center mt-2">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors[currentQuestion.id]}
                      </div>
                    )}
                  </div>
                )}

                {currentQuestion.type === "textarea" && (
                  <div className="space-y-2">
                    <Textarea
                      id={currentQuestion.id}
                      placeholder={currentQuestion.placeholder}
                      value={currentQuestion.value as string}
                      onChange={
                        isTextAreaHandler(currentQuestion.onChange)
                          ? currentQuestion.onChange
                          : undefined
                      }
                      className={`text-lg py-4 px-4 min-h-[150px] border-0 border-b-2 ${
                        validationErrors[currentQuestion.id]
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-200 dark:border-gray-800"
                      } rounded-none focus:ring-0 focus:border-gray-900 dark:focus:border-gray-100 bg-transparent resize-none`}
                    />
                    {validationErrors[currentQuestion.id] && (
                      <div className="text-red-500 flex items-center mt-2">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors[currentQuestion.id]}
                      </div>
                    )}
                  </div>
                )}

                {currentQuestion.type === "radio" && (
                  <div className="space-y-3">
                    <RadioGroup
                      value={currentQuestion.value as string}
                      onValueChange={(value: string) => {
                        if (typeof currentQuestion.onChange === "function") {
                          (currentQuestion.onChange as (value: string) => void)(
                            value
                          );
                        }
                      }}
                      className="space-y-3"
                    >
                      {currentQuestion.options?.map((option) => (
                        <div
                          key={option}
                          className={`flex items-center space-x-2 border ${
                            validationErrors[currentQuestion.id]
                              ? "border-red-200 dark:border-red-900"
                              : "border-gray-200 dark:border-gray-800"
                          } rounded-lg p-4 transition-all hover:bg-white/50 dark:hover:bg-gray-900/50 cursor-pointer`}
                          onClick={() => {
                            if (
                              typeof currentQuestion.onChange === "function"
                            ) {
                              (
                                currentQuestion.onChange as (
                                  value: string
                                ) => void
                              )(option);
                            }
                          }}
                        >
                          <RadioGroupItem
                            value={option}
                            id={option}
                            className="sr-only"
                          />
                          <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            {currentQuestion.value === option && (
                              <div className="w-3 h-3 rounded-full bg-gray-900 dark:bg-gray-100" />
                            )}
                          </div>
                          <Label
                            htmlFor={option}
                            className="flex-1 cursor-pointer text-lg font-light"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {validationErrors[currentQuestion.id] && (
                      <div className="text-red-500 flex items-center mt-2">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors[currentQuestion.id]}
                      </div>
                    )}
                  </div>
                )}

                {currentQuestion.type === "checkbox" && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 border ${
                          validationErrors[currentQuestion.id]
                            ? "border-red-200 dark:border-red-900"
                            : "border-gray-200 dark:border-gray-800"
                        } rounded-lg p-4 transition-all cursor-pointer ${
                          (currentQuestion.value as string[]).includes(option)
                            ? "bg-white/50 dark:bg-gray-900/50"
                            : "hover:bg-white/30 dark:hover:bg-gray-900/30"
                        }`}
                        onClick={() => {
                          if (typeof currentQuestion.onChange === "function") {
                            (
                              currentQuestion.onChange as (
                                value: string
                              ) => void
                            )(option);
                          }
                        }}
                      >
                        <div
                          className={`w-5 h-5 border rounded flex items-center justify-center ${
                            (currentQuestion.value as string[]).includes(option)
                              ? "border-gray-900 dark:border-gray-100"
                              : "border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {(currentQuestion.value as string[]).includes(
                            option
                          ) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              className="w-3 h-3"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <Label className="flex-1 cursor-pointer text-lg font-light">
                          {option}
                        </Label>
                      </div>
                    ))}
                    {validationErrors[currentQuestion.id] && (
                      <div className="text-red-500 flex items-center mt-2">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors[currentQuestion.id]}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex justify-between pt-6"
              >
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={step === -1}
                  className="px-6 py-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 rounded-full"
                >
                  {step === questions.length - 1
                    ? isSubmitting
                      ? "Submitting..."
                      : "Complete"
                    : "Next"}
                  {step !== questions.length - 1 && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Completion Screen */}
        {isComplete && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-3xl px-6 py-12 mx-auto relative z-10 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900 dark:text-gray-50">
                Thank You, {formData.name}!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8">
                Your information has been submitted successfully. We&apos;re
                excited to have you on board!
              </p>
              <Button
                onClick={() => {
                  setStep(-1);
                  setIsComplete(false);
                  setFormData({
                    name: "",
                    role: "" as Role,
                    experience: "" as Experience,
                    goals: "",
                    interests: [],
                  });
                  setValidationErrors({});
                }}
                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 rounded-full"
              >
                Start Over
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step indicator - only show during questions */}
      {step >= 0 && !isComplete && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === step
                  ? "bg-gray-900 dark:bg-gray-100 scale-125"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
