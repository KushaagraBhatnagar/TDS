/**
 * Calculates a matching score between a client and a list of candidate profiles.
 * Returns the candidate profiles sorted by score descending, with detailed sub-score breakdowns.
 */
export function calculateMatches(client, candidates, customWeights = {}) {
  const weights = {
    age: customWeights.age !== undefined ? Number(customWeights.age) : 5,
    location: customWeights.location !== undefined ? Number(customWeights.location) : 5,
    income: customWeights.income !== undefined ? Number(customWeights.income) : 5,
    diet: customWeights.diet !== undefined ? Number(customWeights.diet) : 5,
    values: customWeights.values !== undefined ? Number(customWeights.values) : 5,
    education: customWeights.education !== undefined ? Number(customWeights.education) : 5,
    religion: customWeights.religion !== undefined ? Number(customWeights.religion) : 5
  };

  const getAge = (dob) => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const clientAge = getAge(client.dob);

  const scoredCandidates = candidates.map(candidate => {
    const candidateAge = getAge(candidate.dob);
    
    // Evaluate age fit
    let ageScore = 100;
    const ageDiff = candidateAge - clientAge;

    if (client.gender === 'male') {
      if (ageDiff > 0) {
        ageScore = Math.max(0, 100 - (ageDiff * 15)); // Penalize older candidates
      } else if (ageDiff < -8) {
        ageScore = Math.max(20, 100 - (Math.abs(ageDiff) - 8) * 10); // Too young
      } else {
        const idealGap = Math.abs(ageDiff);
        ageScore = (idealGap >= 1 && idealGap <= 5) ? 100 : 90; // Ideal: 1-5 years younger
      }
    } else {
      if (ageDiff < -3) {
        ageScore = Math.max(10, 100 - (Math.abs(ageDiff) - 3) * 15); // Too young
      } else if (ageDiff > 7) {
        ageScore = Math.max(10, 100 - (ageDiff - 7) * 12); // Too old
      } else {
        ageScore = (ageDiff >= 0 && ageDiff <= 5) ? 100 : 85; // Ideal: 0-5 years older
      }
    }

    // Evaluate height fit
    let heightScore = 100;
    const heightDiff = candidate.height - client.height;

    if (client.gender === 'male') {
      if (heightDiff > 0) {
        heightScore = Math.max(0, 100 - (heightDiff * 8)); // Penalty if candidate is taller
      } else {
        const diffAbs = Math.abs(heightDiff);
        if (diffAbs >= 5 && diffAbs <= 15) {
          heightScore = 100; // Ideal height difference
        } else if (diffAbs < 5) {
          heightScore = 90;
        } else {
          heightScore = Math.max(30, 100 - (diffAbs - 15) * 3);
        }
      }
    } else {
      if (heightDiff < 0) {
        heightScore = Math.max(0, 100 - (Math.abs(heightDiff) * 8)); // Penalty if candidate is shorter
      } else {
        const diffAbs = heightDiff;
        heightScore = (diffAbs >= 5 && diffAbs <= 18) ? 100 : 90; // Ideal: candidate is 5-18 cm taller
      }
    }

    // Physical sub-score: age 70% weight, height 30% weight
    const physicalSubScore = (ageScore * 0.7) + (heightScore * 0.3);

    // Location Fit
    let locationScore = 0;
    if (client.city.toLowerCase() === candidate.city.toLowerCase()) {
      locationScore = 100;
    } else if (client.country.toLowerCase() === candidate.country.toLowerCase()) {
      locationScore = 60;
      if (client.openToRelocate === 'Yes' || candidate.openToRelocate === 'Yes') {
        locationScore += 25;
      } else if (client.openToRelocate === 'Maybe' || candidate.openToRelocate === 'Maybe') {
        locationScore += 10;
      }
    } else {
      locationScore = 20;
      if (client.openToRelocate === 'Yes' && candidate.openToRelocate === 'Yes') {
        locationScore += 40;
      }
    }
    locationScore = Math.min(100, locationScore);

    // Income Fit
    let incomeScore = 100;
    const clientInc = Number(client.income);
    const candInc = Number(candidate.income);

    if (clientInc && candInc) {
      const ratio = candInc / clientInc;
      if (client.gender === 'female') {
        if (ratio >= 0.9) {
          incomeScore = 100;
        } else if (ratio >= 0.5) {
          incomeScore = 75;
        } else {
          incomeScore = Math.max(20, 100 - (1 - ratio) * 120);
        }
      } else {
        const diffPercent = Math.abs(clientInc - candInc) / Math.max(clientInc, candInc);
        incomeScore = Math.max(40, 100 - (diffPercent * 80));
      }
    }

    // Diet Fit
    let dietScore = 100;
    if (client.diet === candidate.diet) {
      dietScore = 100;
    } else {
      const strictVeg = ['Pure Veg', 'Jain'];
      const nonVeg = ['Non-Veg', 'Eggitarian'];

      if (strictVeg.includes(client.diet) && nonVeg.includes(candidate.diet)) {
        dietScore = 10; // Strict mismatch (veg vs non-veg)
      } else if (nonVeg.includes(client.diet) && strictVeg.includes(candidate.diet)) {
        dietScore = 50; // Veg candidate is usually less open to non-veg, but non-veg partner might adjust
      } else {
        dietScore = 75;
      }
    }

    // Values Fit (Kids, Pets, Family Values, Relocation)
    let valuesScore = 50;
    let valuesMatchCount = 0;
    let totalValueFields = 0;

    // Kids Alignment
    totalValueFields++;
    if (client.wantKids === candidate.wantKids) {
      valuesMatchCount += 1;
    } else if (client.wantKids === 'Maybe' || candidate.wantKids === 'Maybe') {
      valuesMatchCount += 0.5;
    }

    // Pets Alignment
    totalValueFields++;
    if (client.openToPets === candidate.openToPets) {
      valuesMatchCount += 1;
    } else if (client.openToPets === 'Maybe' || candidate.openToPets === 'Maybe') {
      valuesMatchCount += 0.5;
    }

    // Family Values Alignment
    totalValueFields++;
    if (client.familyValues === candidate.familyValues) {
      valuesMatchCount += 1;
    } else {
      if (client.familyValues === 'Moderate' || candidate.familyValues === 'Moderate') {
        valuesMatchCount += 0.6;
      } else {
        valuesMatchCount += 0.1;
      }
    }

    // Shared languages bonus
    let langBonus = 0;
    if (client.languagesKnown && candidate.languagesKnown) {
      const sharedLangs = client.languagesKnown.filter(lang => 
        candidate.languagesKnown.includes(lang)
      );
      if (sharedLangs.length > 0) langBonus = 10;
    }

    valuesScore = Math.min(100, ((valuesMatchCount / totalValueFields) * 100) + langBonus);

    // Education Fit
    let educationScore = 70;
    const degA = client.degree.toLowerCase();
    const degB = candidate.degree.toLowerCase();

    const isPostGrad = (text) => text.includes('mba') || text.includes('mtech') || text.includes('ms') || text.includes('md') || text.includes('phd') || text.includes('master');
    const isDoctor = (text) => text.includes('dr') || text.includes('phd') || text.includes('mbbs');
    
    if (isPostGrad(degA) && isPostGrad(degB)) {
      educationScore = 100;
    } else if (isDoctor(degA) && isDoctor(degB)) {
      educationScore = 100;
    } else if (degA === degB) {
      educationScore = 95;
    } else {
      educationScore = 80;
    }

    // Religion & Community Fit
    let religionScore = 50;
    if (client.religion === candidate.religion) {
      religionScore = 80;
      
      // Caste check
      if (client.caste === candidate.caste) {
        religionScore += 15;
        // Same Gotra is traditionally avoided in Hindu matches
        if (client.religion.toLowerCase() === 'hindu' && client.gotra && candidate.gotra && client.gotra.toLowerCase() === candidate.gotra.toLowerCase()) {
          religionScore -= 15;
        }
      }
      
      if (client.manglikStatus === candidate.manglikStatus) {
        religionScore += 5;
      }
    } else {
      religionScore = 20;
    }
    religionScore = Math.min(100, Math.max(0, religionScore));

    // Calculate final weighted score
    const sumWeights = 
      weights.age + 
      weights.location + 
      weights.income + 
      weights.diet + 
      weights.values + 
      weights.education + 
      weights.religion;

    const weightedScore = (
      (physicalSubScore * weights.age) +
      (locationScore * weights.location) +
      (incomeScore * weights.income) +
      (dietScore * weights.diet) +
      (valuesScore * weights.values) +
      (educationScore * weights.education) +
      (religionScore * weights.religion)
    ) / sumWeights;

    const finalScore = Math.round(weightedScore);

    return {
      profile: candidate,
      score: finalScore,
      breakdown: {
        age: Math.round(physicalSubScore),
        location: Math.round(locationScore),
        income: Math.round(incomeScore),
        diet: Math.round(dietScore),
        values: Math.round(valuesScore),
        education: Math.round(educationScore),
        religion: Math.round(religionScore)
      }
    };
  });

  return scoredCandidates.sort((a, b) => b.score - a.score);
}
