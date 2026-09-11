import { useEffect, useRef, useState, useCallback } from "react";
import { PUBLIC_ADDRESS } from "#/lib/data.ts";

export function useCanvasVideo(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  frameCount: number = 72,
) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  const imageFolder = `${PUBLIC_ADDRESS}/landing-footage/`;
  const imagePrefix = "frame_";
  const imageExtension = ".jpeg";

  const savedImages = useRef<Array<HTMLImageElement>>([]);
  const loadingPromises = useRef<Map<number, Promise<HTMLImageElement>>>(new Map());
  const lastDrawnIndex = useRef<number>(-1);
  const currentRequestedIndex = useRef<number>(0);

  const padNumber = useCallback((num: number) => num.toString().padStart(4, "0"), []);

  const loadFrame = useCallback(
    (index: number): Promise<HTMLImageElement> => {
      if (loadingPromises.current.has(index)) {
        return loadingPromises.current.get(index)!;
      }

      const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const filename = `${imagePrefix}${padNumber(index)}${imageExtension}`;
        img.src = `${imageFolder}${filename}`;

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load frame ${index}`));
      });

      loadingPromises.current.set(index, promise);
      return promise;
    },
    [imageFolder, imagePrefix, imageExtension, padNumber]
  );

  const findNearestLoadedFrame = useCallback((targetIndex: number): { img: HTMLImageElement; index: number } | null => {
    // Search backwards from targetIndex
    for (let i = targetIndex; i >= 0; i--) {
      const img = savedImages.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        return { img, index: i };
      }
    }
    // Search forwards from targetIndex
    for (let i = targetIndex + 1; i < frameCount; i++) {
      const img = savedImages.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        return { img, index: i };
      }
    }
    return null;
  }, [frameCount]);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: false,
      colorSpace: "display-p3",
    });
    if (!context) return;

    const imgIndex = Math.min(frameCount - 1, Math.max(0, Math.round(index)));
    currentRequestedIndex.current = imgIndex;

    const dpr = devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    // Check if target frame is ready
    let targetImg = savedImages.current[imgIndex];
    let chosenIndex = imgIndex;

    if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) {
      // Trigger background load for target frame if not loading
      if (!loadingPromises.current.has(imgIndex + 1)) {
        loadFrame(imgIndex + 1).then((loadedImg) => {
          savedImages.current[imgIndex] = loadedImg;
          setLoadedCount((prev) => prev + 1);
          if (Math.abs(currentRequestedIndex.current - imgIndex) <= 2) {
            drawFrame(currentRequestedIndex.current);
          }
        }).catch(() => {});
      }

      // Find nearest loaded frame so canvas NEVER turns black or freezes
      const fallback = findNearestLoadedFrame(imgIndex);
      if (fallback) {
        targetImg = fallback.img;
        chosenIndex = fallback.index;
      } else {
        return;
      }
    }

    const needsResize = canvas.width !== width * dpr || canvas.height !== height * dpr;
    if (!needsResize && chosenIndex === lastDrawnIndex.current) {
      return;
    }

    if (needsResize) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.scale(dpr, dpr);
    }

    const vW = targetImg.naturalWidth;
    const vH = targetImg.naturalHeight;
    const rW = width / vW;
    const rH = height / vH;
    const ratio = Math.max(rW, rH);

    const newW = vW * ratio;
    const newH = vH * ratio;
    const x = (width - newW) / 2;
    const y = (height - newH) / 2;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(targetImg, x, y, newW, newH);
    lastDrawnIndex.current = chosenIndex;
  }, [canvasRef, frameCount, loadFrame, findNearestLoadedFrame]);

  useEffect(() => {
    let isCancelled = false;

    const initFrames = async () => {
      // 1. Load first frame FIRST for instantaneous initial render
      try {
        const firstImg = await loadFrame(1);
        if (isCancelled) return;
        savedImages.current[0] = firstImg;
        setFirstFrameLoaded(true);
        setLoadedCount(1);
      } catch (error) {
        console.error("Failed to load first frame:", error);
      }

      // 2. Load initial batch (frames 2..30) in parallel for smooth start
      const initialFrames = Math.min(30, frameCount);
      const initialPromises: Promise<HTMLImageElement>[] = [];

      for (let i = 2; i <= initialFrames; i++) {
        const promise = loadFrame(i).then((img) => {
          savedImages.current[i - 1] = img;
          return img;
        });
        initialPromises.push(promise);
      }

      try {
        await Promise.allSettled(initialPromises);
        if (isCancelled) return;
        setLoadedCount(initialFrames);
        setIsInitialized(true);
      } catch (error) {
        if (isCancelled) return;
        setIsInitialized(true);
      }

      // 3. Preload all remaining frames (31..frameCount) in background batches
      const BATCH_SIZE = 8;
      for (let i = initialFrames + 1; i <= frameCount; i += BATCH_SIZE) {
        if (isCancelled) break;
        const batchPromises: Promise<HTMLImageElement>[] = [];
        for (let j = i; j < i + BATCH_SIZE && j <= frameCount; j++) {
          if (!savedImages.current[j - 1]) {
            batchPromises.push(
              loadFrame(j).then((img) => {
                savedImages.current[j - 1] = img;
                return img;
              })
            );
          }
        }
        if (batchPromises.length > 0) {
          await Promise.allSettled(batchPromises);
          if (isCancelled) break;
          setLoadedCount((prev) => Math.min(prev + batchPromises.length, frameCount));
        }
      }
    };

    initFrames();

    return () => {
      isCancelled = true;
    };
  }, [frameCount, loadFrame]);

  const preloadFrames = useCallback(
    async (startIndex: number, endIndex: number) => {
      const promises: Promise<HTMLImageElement>[] = [];
      for (let i = startIndex; i <= endIndex && i <= frameCount; i++) {
        if (!savedImages.current[i - 1]) {
          promises.push(
            loadFrame(i).then((img) => {
              savedImages.current[i - 1] = img;
              return img;
            })
          );
        }
      }
      if (promises.length > 0) {
        await Promise.allSettled(promises);
        setLoadedCount((prev) => Math.min(prev + promises.length, frameCount));
      }
    },
    [frameCount, loadFrame]
  );

  return {
    progress: (loadedCount / frameCount) * 100,
    isLoading: !isInitialized || loadedCount < Math.min(12, frameCount),
    frameCount,
    drawFrame,
    preloadFrames,
    firstFrameLoaded,
    ready: firstFrameLoaded && loadedCount >= 1,
  };
}
