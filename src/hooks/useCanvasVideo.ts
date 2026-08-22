import { PUBLIC_ADDRESS } from "#/lib/data.ts";
import { useRef, useState } from "react";

export function useCanvasVideo(canvasRef, frameCount) {
	const [images, setImages] = useState([]);
	const [loadedCount, setLoadedCount] = useState(0);

	const imageFolder = `${PUBLIC_ADDRESS}/landing-footage/`;
	const imagePrefix = "frame_";
	const imageExtension = ".jpeg";

	const savedImages = useRef([]);
}
