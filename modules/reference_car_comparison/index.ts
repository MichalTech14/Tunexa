/**
 * Reference Car Comparison logic
 * Compare car models based on user-selected parameters
 */

export interface CarSpecs {
  model: string;
  horsepower: number;
  torque: number;
  audioScore: number;
  price: number;
}

export function compareCars(carA: CarSpecs, carB: CarSpecs): string {
  let result = `Comparing ${carA.model} vs ${carB.model}:
`;
  result += `Horsepower: ${carA.horsepower} vs ${carB.horsepower}
`;
  result += `Torque: ${carA.torque} vs ${carB.torque}
`;
  result += `Audio Score: ${carA.audioScore} vs ${carB.audioScore}
`;
  result += `Price: €${carA.price} vs €${carB.price}
`;
  return result;
}