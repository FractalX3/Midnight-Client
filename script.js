// Simple animated starfield on a full-screen canvas
(() => {
	const canvas = document.getElementById('stars');
	const ctx = canvas.getContext('2d');
	let stars = [];
	let STAR_COUNT = Math.floor(window.innerWidth * 0.08);
	let prevW = window.innerWidth;
	let prevH = window.innerHeight;

	function resize() {
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.floor(window.innerWidth * dpr);
		canvas.height = Math.floor(window.innerHeight * dpr);
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const newW = window.innerWidth;
		const newH = window.innerHeight;
		if(!stars.length){
			STAR_COUNT = Math.floor(newW * 0.08);
			initStars();
		} else {
			// If viewport changed significantly, re-create stars. Otherwise scale positions to avoid jumps.
			if(Math.abs(newW - prevW) > 40 || Math.abs(newH - prevH) > 40){
				STAR_COUNT = Math.floor(newW * 0.08);
				initStars();
			} else {
				const sx = newW / prevW;
				const sy = newH / prevH;
				for(const s of stars){ s.x *= sx; s.y *= sy; }
				for(const st of shootingStars){ st.x *= sx; st.y *= sy; st.dx *= sx; st.dy *= sy; }
			}
		}
		prevW = newW; prevH = newH;
	}

	function rand(min, max){ return Math.random() * (max - min) + min }

	function initStars(){
		stars = [];
		for(let i=0;i<STAR_COUNT;i++){
			stars.push({
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				r: Math.random() * 1.6 + 0.3,
				alpha: Math.random() * 0.9 + 0.1,
				twinkle: Math.random() * 0.02 + 0.003,
				phase: Math.random() * Math.PI * 2
			});
		}
	}

	function draw(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
		// faint nebula gradient overlay
		const g = ctx.createLinearGradient(0,0,0,window.innerHeight);
		g.addColorStop(0,'rgba(8,12,30,0.12)');
		g.addColorStop(1,'rgba(0,3,10,0.18)');
		ctx.fillStyle = g;
		ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

		for(const s of stars){
			s.phase += s.twinkle;
			const a = s.alpha + Math.sin(s.phase) * 0.3;
			ctx.beginPath();
			ctx.globalAlpha = Math.max(0, Math.min(1, a));
			const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r*6);
			grd.addColorStop(0, 'rgba(255,255,255,0.9)');
			grd.addColorStop(0.2, 'rgba(180,210,255,0.35)');
			grd.addColorStop(1, 'rgba(124,231,255,0)');
			ctx.fillStyle = grd;
			ctx.arc(s.x, s.y, s.r*4, 0, Math.PI*2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
		// update and draw shooting stars (blurred, fading trails)
		for(let i = shootingStars.length - 1; i >= 0; i--){
			const st = shootingStars[i];
			st.progress += st.speed;
			const px = st.x + st.dx * st.progress;
			const py = st.y + st.dy * st.progress;
			const tailProgress = Math.max(0, st.progress - 0.08);
			const tx = st.x + st.dx * tailProgress;
			const ty = st.y + st.dy * tailProgress;
			ctx.save();
			ctx.globalCompositeOperation = 'lighter';
			ctx.lineWidth = st.width;
			const grad = ctx.createLinearGradient(tx, ty, px, py);
			grad.addColorStop(0, 'rgba(255,255,255,0)');
			grad.addColorStop(0.6, 'rgba(180,210,255,0.45)');
			grad.addColorStop(1, 'rgba(255,255,255,1)');
			ctx.strokeStyle = grad;
			ctx.globalAlpha = Math.max(0, 1 - st.progress);
			ctx.filter = 'blur(2px)';
			ctx.beginPath();
			ctx.moveTo(px, py);
			ctx.lineTo(tx, ty);
			ctx.stroke();
			ctx.restore();
			if(st.progress >= 1) shootingStars.splice(i,1);
		}
		requestAnimationFrame(draw);
	}

		// shooting star system: blurred tail and fade-out
		const shootingStars = [];

		function spawnShootingStar(){
			const sx = rand(0, window.innerWidth * 0.9);
			const sy = rand(0, window.innerHeight * 0.35);
			const len = rand(120, 320);
			const angle = rand(-0.28, -0.06); // slight downward-left trajectory
			const dx = Math.cos(angle) * len;
			const dy = Math.sin(angle) * len;
			const speed = rand(0.01, 0.03);
			const width = rand(1, 2.6);
			shootingStars.push({x: sx, y: sy, dx, dy, progress: 0, speed, width});
			// schedule next spawn
			setTimeout(spawnShootingStar, rand(4000, 12000));
		}

	window.addEventListener('resize', () => {
		resize();
	});

	// set year in footer
	document.getElementById('year').textContent = new Date().getFullYear();

	resize();
	draw();
	setTimeout(spawnShootingStar, 3000);
})();
