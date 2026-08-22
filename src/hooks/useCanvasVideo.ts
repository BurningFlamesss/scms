import { useEffect, useRef, useState } from "react";
import { PUBLIC_ADDRESS } from "#/lib/data.ts";

export function useCanvasVideo(
	canvasRef: React.RefObject<HTMLCanvasElement> | null,
	frameCount: number,
) {
	const [images, setImages] = useState([]);
	const [loadedCount, setLoadedCount] = useState(0);

	const imageFolder = `${PUBLIC_ADDRESS}/landing-footage/`;
	const imagePrefix = "frame_";
	const imageExtension = ".jpeg";

	const savedImages = useRef<Array<HTMLImageElement>>([]);

	useEffect(() => {
		const loadedImages: Array<HTMLImageElement> = [];
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
	}, [frameCount, imageFolder]);

	const drawFrame = (index) => {
		const canvas = canvasRef?.current;

		if (!canvas) return;

		const context = canvas.getContext("2d", {
			alpha: false,
			colorSpace: "display-p3",
		});

		if (!context) return;

		const dpr = devicePixelRatio || 1;

		const rect = canvas.getBoundingClientRect();

		if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			context.scale(dpr, dpr);
		}

        const width = rect.width
        const height = rect.width

        const imgIndex = Math.min(frameCount - 1, Math.max(0, Math.round(index)))

        const img = savedImages.current[imgIndex]

        if (!img || !img.complete || img.naturalWidth === 0) return;

        const vW = img.naturalWidth
        const vH = img.naturalHeight
        const rW = width / vW
        const rH = height / vH
        const ratio = Math.max(rW, rH)

        const newW = vW * ratio
        const newH = vH * ratio
        const x = (width - newW) / 2
        const y = (height - newH) / 2

        
	};

	return {
		progress: (loadedCount / frameCount) * 100,
		isLoading: loadedCount < frameCount,
		frameCount,
		drawFrame,
	};
}
