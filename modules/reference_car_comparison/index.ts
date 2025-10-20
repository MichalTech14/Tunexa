/**
 * Reference Car Comparison logic
 * Compare car models based on user-selected parameters
 */

export interface AudioSystem {
  speakers: number;
  system: string;
  locations: string[];
}

export interface CarModel {
  name: string;
  types: string[];
  audio: AudioSystem;
}

export interface CarBrand {
  brand: string;
  models: CarModel[];
}

export interface CarSpecs {
  model: string;
  horsepower: number;
  torque: number;
  audioScore: number;
  price: number;
  audio?: AudioSystem; // Optional detailed audio info
}

export function compareCars(carA: CarSpecs, carB: CarSpecs): string {
  let result = `Comparing ${carA.model} vs ${carB.model}:\n`;
  result += `Horsepower: ${carA.horsepower} vs ${carB.horsepower}\n`;
  result += `Torque: ${carA.torque} vs ${carB.torque}\n`;
  result += `Audio Score: ${carA.audioScore} vs ${carB.audioScore}\n`;
  result += `Price: €${carA.price} vs €${carB.price}\n`;
  
  // Add detailed audio comparison if available
  if (carA.audio && carB.audio) {
    result += `\nDetailed Audio Comparison:\n`;
    result += `Speakers: ${carA.audio.speakers} vs ${carB.audio.speakers}\n`;
    result += `System: ${carA.audio.system} vs ${carB.audio.system}\n`;
    result += `Locations A: ${carA.audio.locations.join(', ')}\n`;
    result += `Locations B: ${carB.audio.locations.join(', ')}\n`;
  }
  
  return result;
}

export function compareCarModels(
  carA: CarSpecs,
  carB: CarSpecs,
  modelA: string,
  modelB: string,
  criteria: string[]
): {
  comparison: {
    model_a: string;
    model_b: string;
    criteria: string[];
    results: {
      criterion: string;
      model_a_value: any;
      model_b_value: any;
      winner: string;
      difference?: number;
      notes?: string;
    }[];
    overall_winner: string;
    summary: string;
  };
} {
  const results: any[] = [];
  let scoreA = 0;
  let scoreB = 0;

  criteria.forEach(criterion => {
    let valueA: any;
    let valueB: any;
    let winner: string;
    let difference: number | undefined;
    let notes: string | undefined;

    switch (criterion.toLowerCase()) {
      case 'horsepower':
      case 'power':
        valueA = carA.horsepower;
        valueB = carB.horsepower;
        winner = valueA > valueB ? modelA : valueB > valueA ? modelB : 'tie';
        difference = Math.abs(valueA - valueB);
        if (winner === modelA) scoreA++;
        else if (winner === modelB) scoreB++;
        break;

      case 'torque':
        valueA = carA.torque;
        valueB = carB.torque;
        winner = valueA > valueB ? modelA : valueB > valueA ? modelB : 'tie';
        difference = Math.abs(valueA - valueB);
        if (winner === modelA) scoreA++;
        else if (winner === modelB) scoreB++;
        break;

      case 'audio':
      case 'audioscore':
        valueA = carA.audioScore;
        valueB = carB.audioScore;
        winner = valueA > valueB ? modelA : valueB > valueA ? modelB : 'tie';
        difference = Math.abs(valueA - valueB);
        if (winner === modelA) scoreA++;
        else if (winner === modelB) scoreB++;
        break;

      case 'price':
        valueA = carA.price;
        valueB = carB.price;
        winner = valueA < valueB ? modelA : valueB < valueA ? modelB : 'tie'; // Lower price wins
        difference = Math.abs(valueA - valueB);
        notes = 'Lower price is better';
        if (winner === modelA) scoreA++;
        else if (winner === modelB) scoreB++;
        break;

      case 'speakers':
        valueA = carA.audio?.speakers || 4;
        valueB = carB.audio?.speakers || 4;
        winner = valueA > valueB ? modelA : valueB > valueA ? modelB : 'tie';
        difference = Math.abs(valueA - valueB);
        if (winner === modelA) scoreA++;
        else if (winner === modelB) scoreB++;
        break;

      default:
        valueA = 'N/A';
        valueB = 'N/A';
        winner = 'tie';
        notes = `Unknown criterion: ${criterion}`;
    }

    results.push({
      criterion,
      model_a_value: valueA,
      model_b_value: valueB,
      winner,
      difference,
      notes,
    });
  });

  const overallWinner = scoreA > scoreB ? modelA : scoreB > scoreA ? modelB : 'tie';
  const summary = `${modelA} scored ${scoreA}/${criteria.length}, ${modelB} scored ${scoreB}/${criteria.length}. ${
    overallWinner === 'tie' ? 'It\'s a tie!' : `${overallWinner} wins overall.`
  }`;

  return {
    comparison: {
      model_a: modelA,
      model_b: modelB,
      criteria,
      results,
      overall_winner: overallWinner,
      summary,
    },
  };
}

export function calculateAudioScore(audio: AudioSystem): number {
  // Calculate audio score based on speaker count and system type
  let baseScore = audio.speakers * 5; // Base score from speaker count
  
  // Premium system bonuses
  const premiumSystems: { [key: string]: number } = {
    'Bose': 20,
    'Bang & Olufsen': 30,
    'Burmester': 35,
    'Harman Kardon': 25,
    'JBL': 15,
    'Mark Levinson': 40,
    'Bowers & Wilkins': 35,
    'Dynaudio': 30,
    'Meridian': 30,
    'Canton': 20,
    'Focal': 25,
    'Lexicon': 25,
    'AKG': 20,
    'Revel': 30,
    'ELS': 25,
    'Tesla Premium': 25,
    'NIO Premium': 20,
    'Infinity': 15
  };
  
  // Check for premium system bonus
  for (const [system, bonus] of Object.entries(premiumSystems)) {
    if (audio.system.includes(system)) {
      baseScore += bonus;
      break;
    }
  }
  
  // Additional bonuses for special features
  if (audio.system.includes('3D') || audio.system.includes('Surround')) {
    baseScore += 10;
  }
  if (audio.system.includes('Premium') || audio.system.includes('High-End')) {
    baseScore += 15;
  }
  if (audio.locations.some(loc => loc.includes('Strešné') || loc.includes('sedadlá'))) {
    baseScore += 10;
  }
  
  return Math.min(baseScore, 100); // Cap at 100
}