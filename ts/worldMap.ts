
export default (async () => {
	{
		// country borders test

		const countryBorders: Record<string, any>[] = (await (await fetch(
			// "./data/borders.min.json"
			// "./data/custom-large.geo.json"
			// "./data/countries-datahub.geo.json"
			"./data/countries-land-1km.geo.json"
		)).json()).features;

		const canvas: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>("game canvas");
		const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

		{
			const resize = () => {
				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientHeight;
			};

			resize();

			window.addEventListener("resize", resize);
		}

		let mouseX: number = 0;
		let mouseY: number = 0;

		let centerX: number = 0;
		let centerY: number = 0;
		let zoom: number = 0;
		const scalePerZoom: number = 1.5;

		window.addEventListener("pointermove", (evt: MouseEvent) => {
			// @ts-ignore
			mouseX = evt.layerX;
			// @ts-ignore
			mouseY = evt.layerY;

			if (evt.buttons === 1) {
				centerX -= (evt.movementX / (canvas.width / 2)) / ((scalePerZoom ** zoom) / 180);
				centerY += (evt.movementY / (canvas.height / 2)) / ((canvas.width / canvas.height) * (scalePerZoom ** zoom) / 180);
			}
		});

		window.addEventListener("wheel", (evt: WheelEvent) => {
			// @ts-ignore
			const [x, y]: [number, number] = [evt.layerX, evt.layerY];

			const pointX = (x / (canvas.width / 2) - 1) / ((scalePerZoom ** zoom) / 180) + centerX;
			const pointY = (y / (canvas.height / 2) - 1) / ((canvas.width / canvas.height) * (scalePerZoom ** zoom) / -180) + centerY;

			const delta = evt.deltaY / 100;
			zoom -= delta;

			centerX = pointX - (pointX - centerX) * (scalePerZoom ** delta);
			centerY = pointY - (pointY - centerY) * (scalePerZoom ** delta);
		});


		{
			const draw = () => {
				ctx.strokeStyle = "white";
				ctx.lineWidth = 1;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";

				ctx.clearRect(0, 0, canvas.width, canvas.height);

				for (const country of countryBorders) {
					const geometry: Record<string, any> = country.geometry;
					const coordinates: [number, number][][][] = (() => {
						switch (geometry.type) {
							case ("Polygon"): return [geometry.coordinates];
							case ("MultiPolygon"): return geometry.coordinates;
							default: throw new Error(`Unknown geometry type: ${geometry.type}`);
						}
					})();

					for (const polygon of coordinates) {
						ctx.beginPath();
						// @ ts-ignore
						for (const [x, y] of polygon[0]) {
							ctx.lineTo(
								(
									(x - centerX) * (scalePerZoom ** zoom) / 180 + 1
								) * canvas.width / 2,
								(
									(y - centerY) * (canvas.width / canvas.height) * (scalePerZoom ** zoom) / -180 + 1
								) * canvas.height / 2,
							);
						}
						ctx.closePath();
						if (ctx.isPointInPath(mouseX, mouseY)) {
							ctx.fillStyle = "darkRed";
							ctx.fill();
						}
						ctx.stroke();

					}
				}

				window.requestAnimationFrame(draw);
			};

			draw();
		}
	}
});
