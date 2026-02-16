"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function QuizCard() {
  const [age, setAge] = useState<number | "">("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [mainGoal, setMainGoal] = useState<
    "gain weight" | "lose weight" | "maintain weight" | "build muscle" | ""
  >("");
  const [goalWeight, setGoalWeight] = useState<number | "">("");
  const [activityLevel, setActivityLevel] = useState<
    "light" | "moderately active" | "very active" | ""
  >("");

  const handleSubmit = () => {
    // Here you would typically calculate BMR or save the data
    console.log({
      age,
      sex,
      height,
      weight,
      mainGoal,
      goalWeight,
      activityLevel,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Calorie Calculator</h1>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="age">Age (years)</Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            placeholder="e.g., 30"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sex">Sex / Gender</Label>
          <Select
            value={sex}
            onValueChange={(value: "male" | "female") => setSex(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder="e.g., 170"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="e.g., 70"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mainGoal">What's your main goal?</Label>
          <Select
            value={mainGoal}
            onValueChange={(value: typeof mainGoal) => setMainGoal(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gain weight">Gain Weight</SelectItem>
              <SelectItem value="lose weight">Lose Weight</SelectItem>
              <SelectItem value="maintain weight">Maintain Weight</SelectItem>
              <SelectItem value="build muscle">Build Muscle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mainGoal !== "maintain weight" && mainGoal !== "" && (
          <div className="grid gap-2">
            <Label htmlFor="goalWeight">Goal Weight (kg)</Label>
            <Input
              id="goalWeight"
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(Number(e.target.value))}
              placeholder="e.g., 65"
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="activityLevel">How active are you?</Label>
          <Select
            value={activityLevel}
            onValueChange={(value: typeof activityLevel) =>
              setActivityLevel(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Activity Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                Light (e.g., desk job, light exercise 1-3 times/week)
              </SelectItem>
              <SelectItem value="moderately active">
                Moderately Active (e.g., active job, exercise 3-5 times/week)
              </SelectItem>
              <SelectItem value="very active">
                Very Active (e.g., physical job, intense exercise 6-7
                times/week)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSubmit}>Calculate Calories</Button>
      </div>
    </div>
  );
}
