// Simple browser demo for the Reference Car Comparison module
import carsData from "../cars.json" assert { type: "json" };
import { compareCars, calculateAudioScore, type CarSpecs, type AudioSystem } from "../modules/reference_car_comparison/index";

// Pick two cars to compare from the dataset (safe defaults)
const [brandA, brandB] = [carsData[0], carsData[1]];
const modelA = brandA.models[0];
const modelB = brandB.models[0];

function toSpecs(name: string, audio: AudioSystem): CarSpecs {
  // Derive quick mock specs just for a visual demo (not real data)
  const speakers = audio.speakers;
  const base = 100 + speakers * 5;
  const torque = 150 + speakers * 3;
  const price = 20000 + speakers * 800;
  const audioScore = calculateAudioScore(audio);
  return { model: name, horsepower: base, torque, price, audioScore, audio };
}

const carA = toSpecs(`${brandA.brand} ${modelA.name}`, modelA.audio as unknown as AudioSystem);
const carB = toSpecs(`${brandB.brand} ${modelB.name}`, modelB.audio as unknown as AudioSystem);

const pre = document.createElement("pre");
pre.textContent = compareCars(carA, carB);
document.body.appendChild(pre);
