import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Target, Activity, Utensils, Calendar, Download, Share2 } from 'lucide-react';
import type { DietPlanData } from './DietRecommended';


const DietPlan: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dietData, setDietData] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get data from route state
    const state = location.state as { dietPlanData?: DietPlanData };
    
    if (state?.dietPlanData) {
      setDietData(state.dietPlanData);
      setLoading(false);
    } else {
      // No fallback to sessionStorage - data must be passed through navigation
      console.warn('No diet plan data found in navigation state');
      handleNoData();
    }
  }, [location.state]);

  const handleNoData = () => {
    setLoading(false);
    // Could redirect back to form or show error message
  };

  const handleBackToForm = () => {
    navigate(-1); // Go back to previous page
  };

  const handleNewPlan = () => {
    navigate('/main-page/diet-recommend'); // Navigate to form page
  };

  const handleDownload = () => {
    if (!dietData) return;
    
    // Create downloadable text content
    const content = `
MY PERSONALIZED DIET PLAN
Generated on: ${dietData.metadata.formSubmittedAt}

PERSONAL INFORMATION:
- Height: ${dietData.userInput.height} cm
- Weight: ${dietData.userInput.weight} kg
- Age: ${dietData.userInput.age} years
- Gender: ${dietData.userInput.gender}
- Goal: ${dietData.userInput.goal.replace('_', ' ')}
- Activity: ${dietData.userInput.activityType}
- Diet Preference: ${dietData.userInput.preferences}
- Health Condition: ${dietData.userInput.healthIssues}
- Meal Plan: ${dietData.userInput.mealPlan}
- Meals Per Day: ${dietData.userInput.mealFrequency}

NUTRITIONAL TARGETS:
- BMI: ${dietData.recommendations.bmi.toFixed(1)}
- BMR: ${dietData.recommendations.bmr} calories
- TDEE: ${dietData.recommendations.tdee} calories
- Daily Calorie Target: ${dietData.recommendations.calorie_target} calories

RECOMMENDED MEAL: ${dietData.recommendations.name}
- Calories: ${dietData.recommendations.calories}
- Protein: ${dietData.recommendations.protein}g
- Carbs: ${dietData.recommendations.carbs}g
- Fats: ${dietData.recommendations.fats}g
- Fiber: ${dietData.recommendations.fiber}g
- Sugar: ${dietData.recommendations.sugar}g
- Sodium: ${dietData.recommendations.sodium}mg

INSTRUCTIONS:
${dietData.recommendations.Instructions}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-diet-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!dietData) return;
    
    const shareData = {
      title: 'My Personalized Diet Plan',
      text: `Check out my personalized diet plan! Target: ${dietData.recommendations.calorie_target} calories/day`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Diet plan details copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your diet plan...</p>
        </div>
      </div>
    );
  }

  if (!dietData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-gray-400 mb-4">
            <Utensils className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Diet Plan Found</h2>
          <p className="text-gray-600 mb-6">
            It looks like you haven't generated a diet plan yet or the data wasn't passed correctly.
          </p>
          <Button onClick={handleNewPlan} className="w-full">
            Create New Diet Plan
          </Button>
        </div>
      </div>
    );
  }

  const { userInput, recommendations, metadata } = dietData;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { category: 'Normal', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { category: 'Overweight', color: 'bg-yellow-100 text-yellow-800' };
    return { category: 'Obese', color: 'bg-red-100 text-red-800' };
  };

  const bmiInfo = getBMICategory(recommendations.bmi);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Your Diet Plan</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Generated Date */}
        <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Generated on {metadata.formSubmittedAt}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Height:</span>
                <span className="font-medium">{userInput.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-medium">{userInput.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{userInput.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium capitalize">{userInput.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goal:</span>
                <span className="font-medium capitalize">{userInput.goal.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activity:</span>
                <span className="font-medium">{userInput.activityType}</span>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Targets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">BMI:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{typeof recommendations.bmi === 'number'? recommendations.bmi.toFixed(1) : 'N/A'}</span>
                  <Badge className={bmiInfo.color}>{bmiInfo.category}</Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BMR:</span>
                <span className="font-medium">{typeof recommendations.bmr === 'number' ? recommendations.bmr : 'N/A'} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TDEE:</span>
                <span className="font-medium">{typeof recommendations.tdee === 'number' ? recommendations.tdee : 'N/A'} cal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Target:</span>
                <span className="font-medium text-blue-600">{typeof recommendations.calorie_target === 'number' ? recommendations.calorie_target : 'N/A'} cal</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Diet Type:</span>
                <span className="font-medium capitalize">{userInput.preferences}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meal Plan:</span>
                <span className="font-medium">{userInput.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meals/Day:</span>
                <span className="font-medium">{userInput.mealFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health Issues:</span>
                <span className="font-medium">{userInput.healthIssues || 'None'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Meal */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="w-5 h-5" />
              <span>Recommended Meal: {recommendations.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{recommendations.calories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{recommendations.protein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{recommendations.carbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{recommendations.fats}g</div>
                <div className="text-sm text-gray-600">Fats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{recommendations.fiber}g</div>
                <div className="text-sm text-gray-600">Fiber</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{recommendations.sugar}g</div>
                <div className="text-sm text-gray-600">Sugar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{recommendations.sodium}mg</div>
                <div className="text-sm text-gray-600">Sodium</div>
              </div>
            </div>

            {/* Instructions */}
            {recommendations.Instructions && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <p className="text-blue-800 leading-relaxed">{recommendations.Instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <Button onClick={handleNewPlan} className="px-8 py-2">
            Create New Diet Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;