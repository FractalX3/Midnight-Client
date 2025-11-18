// Simple animated starfield on a full-screen canvas
(() => {
	const canvas = document.getElementById('stars');
	const ctx = canvas.getContext('2d');
	let stars = [];
	const STAR_COUNT = Math.floor(window.innerWidth * 0.08);

	function resize() {
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.floor(window.innerWidth * dpr);
		canvas.height = Math.floor(window.innerHeight * dpr);
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		initStars();
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
		requestAnimationFrame(draw);
	}

	// small shooting star occasionally
	function shootingStar(){
		const sx = rand(0, window.innerWidth * 0.6);
		const sy = rand(0, window.innerHeight * 0.4);
		const len = rand(80, 220);
		let progress = 0;
		const speed = rand(0.01, 0.03);
		function frame(){
			progress += speed;
			ctx.save();
			ctx.globalCompositeOperation = 'lighter';
			ctx.strokeStyle = 'rgba(255,255,255,0.9)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(sx + len * progress, sy - len * progress * 0.2);
			ctx.stroke();
			ctx.restore();
			if(progress < 1) requestAnimationFrame(frame);
		}
		frame();
		setTimeout(shootingStar, rand(4000,12000));
	}

	window.addEventListener('resize', () => {
		resize();
	});

	// set year in footer
	document.getElementById('year').textContent = new Date().getFullYear();

	resize();
	draw();
	setTimeout(shootingStar, 3000);
})();
