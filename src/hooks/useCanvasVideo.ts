import { PUBLIC_ADDRESS } from "#/lib/data.ts";
import { useEffect, useRef, useState } from "react";

export function useCanvasVideo(canvasRef, frameCount) {
	const [images, setImages] = useState([]);
	const [loadedCount, setLoadedCount] = useState(0);

	const imageFolder = `${PUBLIC_ADDRESS}/landing-footage/`;
	const imagePrefix = "frame_";
	const imageExtension = ".jpeg";

	const savedImages = useRef<Array<HTMLImageElement>>([]);

	useEffect(() => {
		const loadedImages = [];
		let loadCounter = 0;

		for (let index = 0; index < frameCount; index++) {
			const img = new Image();
			const padNumber = (num: number) => num.toString().padStart(4, "0");

			const filename = `${imagePrefix}${padNumber(index)}${imageExtension}`;
			img.src = `${imageFolder}${filename}`;

			img.onload = () => {
				loadCounter++;
				setLoadedCount(loadCounter);
			};

			savedImages.current[index - 1] = img;

			loadedImages.push(img);
		}
	}, [frameCount]);

	const drawFrame = (index) => {
		const canvas = canvasRef.current;

		if (!canvas) return;
	};

	return {
		progress: (loadedCount / frameCount) * 100,
		isLoading: loadedCount < frameCount,
		frameCount,
		drawFrame,
	};
}
