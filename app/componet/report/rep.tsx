"use client";

import { useEffect, useState } from "react";
import { Link2, Plus, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type HealthProfile = {
  id: number;
  userId: number;
  age: number;
  sex: string;
  height: number;
  weight: number;
  mainGoal: string;
  goalWeight: number | null;
  activityLevel: string;
  bmr: number | null;
  tdee: number | null;
  recommendedCalories: number | null;
  proteinGrams: number | null;
  proteinCalories: number | null;
  fatGrams: number | null;
  fatCalories: number | null;
  carbsGrams: number | null;
  carbsCalories: number | null;
  waterLiters: number | null;
  bmi: number | null;
  bmiStatus: string | null;
  createdAt: string;
  updatedAt: string;
  dailyIntake: {
    id: number;
    userId: number;
    date: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    water: number;
  } | null;
};

export default function Report() {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddIntake, setShowAddIntake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding intake
  const [intakeForm, setIntakeForm] = useState({
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    water: "",
  });

  useEffect(() => {
    fetchHealthProfile();
  }, []);

  const fetchHealthProfile = () => {
    setLoading(true);
    fetch("/api/healthprofile")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Health profile not found");
        }
        return res.json();
      })
      .then((data) => {
        setHealthProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching health profile:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  const handleAddIntake = async () => {
    const calories = parseInt(intakeForm.calories) || 0;
    const protein = parseInt(intakeForm.protein) || 0;
    const fat = parseInt(intakeForm.fat) || 0;
    const carbs = parseInt(intakeForm.carbs) || 0;
    const water = parseFloat(intakeForm.water) || 0;

    if (
      calories === 0 &&
      protein === 0 &&
      fat === 0 &&
      carbs === 0 &&
      water === 0
    ) {
      toast.error("Please enter at least one value");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/healthprofile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calories, protein, fat, carbs, water }),
      });

      if (!response.ok) {
        throw new Error("Failed to update intake");
      }

      const data = await response.json();

      // Update local state with new daily intake
      setHealthProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          dailyIntake: data.dailyIntake,
        };
      });

      // Reset form
      setIntakeForm({
        calories: "",
        protein: "",
        fat: "",
        carbs: "",
        water: "",
      });
      setShowAddIntake(false);
      toast.success("Intake logged successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log intake");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case "lose weight":
        return "Lose Weight";
      case "gain weight":
        return "Gain Weight";
      case "build muscle":
        return "Build Muscle";
      case "maintain weight":
        return "Maintain Weight";
      default:
        return goal;
    }
  };

  const getActivityText = (level: string) => {
    switch (level) {
      case "light":
        return "Lightly Active";
      case "moderately active":
        return "Moderately Active";
      case "very active":
        return "Very Active";
      default:
        return level;
    }
  };

  // Calculate remaining values
  const getRemainingCalories = () => {
    if (!healthProfile) return 0;
    const recommended = healthProfile.recommendedCalories || 0;
    const consumed = healthProfile.dailyIntake?.calories || 0;
    return Math.max(0, recommended - consumed);
  };

  const getRemainingProtein = () => {
    if (!healthProfile) return 0;
    const recommended = healthProfile.proteinGrams || 0;
    const consumed = healthProfile.dailyIntake?.protein || 0;
    return Math.max(0, recommended - consumed);
  };

  const getRemainingFat = () => {
    if (!healthProfile) return 0;
    const recommended = healthProfile.fatGrams || 0;
    const consumed = healthProfile.dailyIntake?.fat || 0;
    return Math.max(0, recommended - consumed);
  };

  const getRemainingCarbs = () => {
    if (!healthProfile) return 0;
    const recommended = healthProfile.carbsGrams || 0;
    const consumed = healthProfile.dailyIntake?.carbs || 0;
    return Math.max(0, recommended - consumed);
  };

  const getRemainingWater = () => {
    if (!healthProfile) return 0;
    const recommended = (healthProfile.waterLiters || 0) * 1000; // Convert to ml
    const consumed = (healthProfile.dailyIntake?.water || 0) * 1000; // Convert to ml
    return Math.max(0, recommended - consumed);
  };

  // Calculate progress percentages
  const getProgressPercentage = (consumed: number, total: number) => {
    if (total === 0) return 0;
    return Math.min(100, (consumed / total) * 100);
  };

  if (loading) {
    return (
      <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Health Report
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Your personalized health data
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      </section>
    );
  }

  if (error || !healthProfile) {
    return (
      <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Health Report
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Your personalized health data
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-6 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            No health data yet
          </p>
          <a
            href="/stepper"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Link2 className="h-4 w-4" />
            Get Your Health Report
          </a>
        </div>
      </section>
    );
  }

  const consumedCalories = healthProfile.dailyIntake?.calories || 0;
  const recommendedCalories = healthProfile.recommendedCalories || 0;
  const caloriesProgress = getProgressPercentage(
    consumedCalories,
    recommendedCalories,
  );

  return (
    <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Health Report
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Your personalized health data
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealthProfile}
            className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <a
            href="/stepper"
            className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            ✏️
          </a>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Main Goal Card */}
        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <div className="text-xs font-medium uppercase tracking-wide opacity-90">
            Current Goal
          </div>
          <div className="mt-1 text-xl font-bold">
            {getGoalText(healthProfile.mainGoal)}
          </div>
          {healthProfile.goalWeight && (
            <div className="mt-2 text-sm opacity-80">
              Goal: {healthProfile.goalWeight} kg
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Age */}
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Age</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {healthProfile.age} years
            </div>
          </div>

          {/* Sex */}
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Sex</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 capitalize">
              {healthProfile.sex}
            </div>
          </div>

          {/* Height */}
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Height
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {healthProfile.height} cm
            </div>
          </div>

          {/* Weight */}
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Weight
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {healthProfile.weight} kg
            </div>
          </div>
        </div>

        {/* Daily Calories Card - Shows Remaining */}
        <div className="rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wide">
              Daily Calories Remaining
            </div>
            <button
              onClick={() => setShowAddIntake(!showAddIntake)}
              className="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900"
            >
              <Plus className="h-3 w-3" />
              Log Intake
            </button>
          </div>

          <div className="mt-1 text-2xl font-bold text-orange-700 dark:text-orange-300">
            {getRemainingCalories()}{" "}
            <span className="text-sm font-normal">kcal remaining</span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-2 bg-orange-200 dark:bg-orange-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${caloriesProgress}%` }}
            />
          </div>

          <div className="mt-1 text-xs text-orange-600 dark:text-orange-400 flex justify-between">
            <span>Consumed: {consumedCalories} kcal</span>
            <span>Goal: {recommendedCalories} kcal</span>
          </div>

          {healthProfile.bmiStatus && (
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              BMI: {healthProfile.bmi} ({healthProfile.bmiStatus})
            </div>
          )}
        </div>

        {/* Add Intake Form */}
        {showAddIntake && (
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 border-2 border-orange-200 dark:border-orange-900/50">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Log Your Intake
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Calories (kcal)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={intakeForm.calories}
                  onChange={(e) =>
                    setIntakeForm({ ...intakeForm, calories: e.target.value })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Protein (g)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={intakeForm.protein}
                  onChange={(e) =>
                    setIntakeForm({ ...intakeForm, protein: e.target.value })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Fat (g)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={intakeForm.fat}
                  onChange={(e) =>
                    setIntakeForm({ ...intakeForm, fat: e.target.value })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Carbs (g)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={intakeForm.carbs}
                  onChange={(e) =>
                    setIntakeForm({ ...intakeForm, carbs: e.target.value })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">
                  Water (liters)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={intakeForm.water}
                  onChange={(e) =>
                    setIntakeForm({ ...intakeForm, water: e.target.value })
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddIntake}
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm"
                size="sm"
              >
                {isSubmitting ? "Adding..." : "Add Intake"}
              </Button>
              <Button
                onClick={() => setShowAddIntake(false)}
                variant="outline"
                className="text-sm"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Macros Grid - Shows Remaining */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-center">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              Protein Left
            </div>
            <div className="text-lg font-bold text-red-700 dark:text-red-300">
              {getRemainingProtein()}g
            </div>
            <div className="text-xs text-red-500 dark:text-red-400">
              of {healthProfile.proteinGrams || 0}g
            </div>
            <div className="mt-1 h-1 bg-red-200 dark:bg-red-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{
                  width: `${getProgressPercentage(
                    healthProfile.dailyIntake?.protein || 0,
                    healthProfile.proteinGrams || 1,
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/30 p-3 text-center">
            <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              Fat Left
            </div>
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
              {getRemainingFat()}g
            </div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400">
              of {healthProfile.fatGrams || 0}g
            </div>
            <div className="mt-1 h-1 bg-yellow-200 dark:bg-yellow-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{
                  width: `${getProgressPercentage(
                    healthProfile.dailyIntake?.fat || 0,
                    healthProfile.fatGrams || 1,
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-3 text-center">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              Carbs Left
            </div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {getRemainingCarbs()}g
            </div>
            <div className="text-xs text-green-500 dark:text-green-400">
              of {healthProfile.carbsGrams || 0}g
            </div>
            <div className="mt-1 h-1 bg-green-200 dark:bg-green-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${getProgressPercentage(
                    healthProfile.dailyIntake?.carbs || 0,
                    healthProfile.carbsGrams || 1,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Water Intake */}
        {healthProfile.waterLiters && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Daily Water Remaining
                </div>
                <div className="text-base font-semibold text-blue-700 dark:text-blue-300">
                  {(getRemainingWater() / 1000).toFixed(1)}L /{" "}
                  {healthProfile.waterLiters}L
                </div>
              </div>
              <div className="text-2xl">💧</div>
            </div>
            <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${getProgressPercentage(
                    healthProfile.dailyIntake?.water || 0,
                    healthProfile.waterLiters || 1,
                  )}%`,
                }}
              />
            </div>
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Consumed: {(healthProfile.dailyIntake?.water || 0).toFixed(1)}L
            </div>
          </div>
        )}

        {/* Activity Level */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Activity Level
          </div>
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {getActivityText(healthProfile.activityLevel)}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          Last updated: {new Date(healthProfile.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </section>
  );
}
