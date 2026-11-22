import {
  BOMB_STUN_SECONDS,
  FallingItem,
  FloatingPopup,
  Gender,
  Particle,
  PlayerState,
  SantaState,
  Snowflake,
} from '../types/game';

const OUTLINE = '#0F172A';

export function drawGroundSnowbank(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number
): void {
  const bankTop = groundY + 18;
  ctx.save();
  // Soft moonlit snow hill silhouette
  const grad = ctx.createLinearGradient(0, bankTop - 16, 0, height);
  grad.addColorStop(0, '#E2E8F0');
  grad.addColorStop(0.35, '#CBD5E1');
  grad.addColorStop(1, '#94A3B8');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, bankTop + 8);
  ctx.quadraticCurveTo(width * 0.25, bankTop - 10, width * 0.5, bankTop + 4);
  ctx.quadraticCurveTo(width * 0.78, bankTop + 16, width, bankTop - 4);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Warm rim highlight along the top snow ridge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, bankTop + 8);
  ctx.quadraticCurveTo(width * 0.25, bankTop - 10, width * 0.5, bankTop + 4);
  ctx.quadraticCurveTo(width * 0.78, bankTop + 16, width, bankTop - 4);
  ctx.stroke();
  ctx.restore();
}

export function drawSnowfall(ctx: CanvasRenderingContext2D, snowflakes: Snowflake[]): void {
  ctx.save();
  for (const flake of snowflakes) {
    ctx.globalAlpha = flake.alpha;
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawSantaAndSleigh(
  ctx: CanvasRenderingContext2D,
  santa: SantaState,
  time: number,
  scale = 1
): void {
  ctx.save();
  ctx.translate(santa.x, santa.y);
  ctx.scale(santa.facing * scale, scale);

  // Gentle sleigh pitch with bobbing & toss kick
  const tossTilt = santa.tossAnimTimer > 0 ? Math.sin(santa.tossAnimTimer * 18) * 0.1 : 0;
  const bobTilt = Math.sin(santa.bobPhase) * 0.045;
  ctx.rotate(bobTilt + tossTilt);

  // Golden magic trail behind sleigh
  ctx.save();
  for (let i = 1; i <= 4; i++) {
    ctx.globalAlpha = 0.25 - i * 0.05;
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(-44 - i * 11, 14 + Math.sin(time * 8 + i) * 3, 4 - i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Reins connecting sleigh to reindeer
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(8, -2);
  ctx.quadraticCurveTo(26, 6, 42, -4);
  ctx.stroke();

  // === REINDEER (right side, facing +X) ===
  const trot = Math.sin(time * 12) * 5;
  ctx.save();
  ctx.translate(46, 0);

  // Back legs
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 10);
  ctx.lineTo(-10 - trot * 0.5, 22);
  ctx.moveTo(8, 10);
  ctx.lineTo(12 + trot * 0.5, 22);
  ctx.stroke();

  // Body
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 4, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Neck & Head
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(13, -7, 8, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red collar with gold bell
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(6, -1);
  ctx.lineTo(13, 3);
  ctx.stroke();
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(11, 4, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Antlers
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(10, -13);
  ctx.lineTo(7, -23);
  ctx.moveTo(8, -18);
  ctx.lineTo(13, -21);
  ctx.moveTo(14, -13);
  ctx.lineTo(16, -22);
  ctx.stroke();

  // Rudolph glowing red nose
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(21, -7, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(254, 202, 202, 0.8)';
  ctx.beginPath();
  ctx.arc(20, -8, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.arc(15, -9, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === SLEIGH & SANTA (left/center) ===
  ctx.save();
  ctx.translate(-14, 0);

  // Sleigh runners (gold)
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-26, 20);
  ctx.lineTo(18, 20);
  ctx.quadraticCurveTo(28, 20, 29, 12);
  ctx.moveTo(-16, 14);
  ctx.lineTo(-16, 20);
  ctx.moveTo(10, 14);
  ctx.lineTo(10, 20);
  ctx.stroke();

  // Gift sack in back of sleigh
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-15, -2, 11, 13, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Santa torso
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, -4, 11, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Santa head
  ctx.fillStyle = '#FDE6C4';
  ctx.beginPath();
  ctx.arc(2, -17, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Beard
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(4, -13, 6.5, 0, Math.PI);
  ctx.fill();

  // Santa hat
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(-6, -21);
  ctx.quadraticCurveTo(0, -33, -10, -29);
  ctx.lineTo(9, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Hat trim & pom-pom
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-7, -23, 17, 4.5, 2.2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-11, -29, 3, 0, Math.PI * 2);
  ctx.fill();

  // Santa waving/tossing arm
  const armWave = santa.tossAnimTimer > 0 ? -0.9 : Math.sin(time * 5) * 0.2;
  ctx.save();
  ctx.translate(3, -8);
  ctx.rotate(armWave);
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(10, -6);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(11, -7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sleigh hull (cranberry red + gold trim)
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.lineTo(-16, 15);
  ctx.lineTo(16, 15);
  ctx.quadraticCurveTo(24, 6, 18, -3);
  ctx.quadraticCurveTo(8, 5, -4, 4);
  ctx.lineTo(-24, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(-15, 13);
  ctx.lineTo(15, 13);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

export function drawFallingItem(
  ctx: CanvasRenderingContext2D,
  item: FallingItem,
  time: number,
  scale = 1
): void {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.scale(scale, scale);
  ctx.rotate(item.rotation);

  switch (item.style) {
    case 'cane': {
      // Candy Cane
      ctx.lineCap = 'round';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(4, 13);
      ctx.lineTo(4, -5);
      ctx.arc(-2, -5, 6, 0, Math.PI, true);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(4, 13);
      ctx.lineTo(4, -5);
      ctx.arc(-2, -5, 6, 0, Math.PI, true);
      ctx.stroke();

      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 6.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(4, 13);
      ctx.lineTo(4, -5);
      ctx.arc(-2, -5, 6, 0, Math.PI, true);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'swirl': {
      // Wrapped Peppermint Swirl Candy
      ctx.fillStyle = '#F472B6';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2;
      // Wrapper wings
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-19, -7);
      ctx.lineTo(-17, 7);
      ctx.closePath();
      ctx.moveTo(10, 0);
      ctx.lineTo(19, -7);
      ctx.lineTo(17, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Candy center
      ctx.fillStyle = '#FFF1F2';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Swirl stripes
      ctx.fillStyle = '#E11D48';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const a = (i * Math.PI * 2) / 3;
        ctx.arc(0, 0, 10, a, a + 0.55);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'lollipop': {
      // Stick
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(0, 19);
      ctx.stroke();

      // Candy disc
      ctx.fillStyle = '#FBBF24';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -4, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -4, 6.5, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#16A34A';
      ctx.fill();
      break;
    }

    case 'red_gold': {
      drawGiftBox(ctx, '#DC2626', '#FBBF24');
      break;
    }
    case 'green_stripe': {
      drawGiftBox(ctx, '#15803D', '#FEF3C7');
      break;
    }
    case 'blue_star': {
      drawGiftBox(ctx, '#2563EB', '#E2E8F0');
      break;
    }

    case 'star_coin':
    case 'snowflake_coin': {
      const glint = 0.85 + 0.15 * Math.sin(time * 7 + item.id);
      ctx.scale(glint, 1);

      // Outer gold rim
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner bright coin face
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(0, 0, 11.2, 0, Math.PI * 2);
      ctx.fill();

      if (item.style === 'star_coin') {
        // 5-point star
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 6.5 : 2.8;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Snowflake emblem
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * -6, Math.sin(a) * -6);
          ctx.lineTo(Math.cos(a) * 6, Math.sin(a) * 6);
          ctx.stroke();
        }
      }

      // Specular shine
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(-5, -5, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'fuse_bomb': {
      // Warning red aura ring
      const pulse = 0.22 + 0.14 * Math.sin(time * 14);
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.beginPath();
      ctx.arc(0, 2, 22, 0, Math.PI * 2);
      ctx.fill();

      // Fuse cap
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-5, -17, 10, 6, 2);
      ctx.fill();
      ctx.stroke();

      // Curved burning rope fuse
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.quadraticCurveTo(7, -25, 12, -21);
      ctx.stroke();

      // Live flickering spark
      const sparkR = 4 + Math.sin(time * 28) * 1.5;
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(13, -21, sparkR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(13, -21, sparkR * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Iron bomb sphere
      const bGrad = ctx.createRadialGradient(-5, -3, 2, 0, 2, 16);
      bGrad.addColorStop(0, '#475569');
      bGrad.addColorStop(0.55, '#1E293B');
      bGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = bGrad;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 2, 15.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bold exclamation warning glyph
      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 15px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 3);
      break;
    }
  }

  ctx.restore();
}

function drawGiftBox(ctx: CanvasRenderingContext2D, boxColor: string, ribbonColor: string): void {
  ctx.fillStyle = boxColor;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-14, -12, 28, 24, 4);
  ctx.fill();
  ctx.stroke();

  // Lid overhang
  ctx.beginPath();
  ctx.roundRect(-16, -14, 32, 7, 3);
  ctx.fill();
  ctx.stroke();

  // Cross ribbon
  ctx.fillStyle = ribbonColor;
  ctx.fillRect(-3, -14, 6, 26);
  ctx.fillRect(-14, -2, 28, 5);

  // Bow loops on top
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-5, -17, 5, 3, -0.35, 0, Math.PI * 2);
  ctx.ellipse(5, -17, 5, 3, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function drawChild(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  gender: Gender,
  time: number,
  scale = 1
): void {
  const isStunned = player.stunTimer > 0;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(scale, scale);

  // Ground shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 32, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stun wobble or catch squash/stretch
  if (isStunned) {
    ctx.translate(Math.sin(time * 36) * 2.5, 0);
  } else if (player.catchBounceTimer > 0) {
    const t = player.catchBounceTimer / 0.22;
    const scaleY = 1 - Math.sin(t * Math.PI) * 0.14;
    const scaleX = 1 + Math.sin(t * Math.PI) * 0.12;
    ctx.scale(scaleX, scaleY);
  }

  // Slight tilt when running
  const lean = isStunned ? 0 : Math.max(-0.1, Math.min(0.1, player.vx / 2800));
  ctx.rotate(lean);

  const stepSwing = isStunned || Math.abs(player.vx) < 15 ? 0 : Math.sin(player.walkPhase) * 5;

  // Boots
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-10 + stepSwing * 0.5, 28, 7, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(10 - stepSwing * 0.5, 28, 7, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Coat / Body
  const coatColor = gender === 'boy' ? '#1D4ED8' : '#BE123C';
  const trimColor = gender === 'boy' ? '#93C5FD' : '#FECDD3';
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(-16, -2);
  ctx.lineTo(-19, 25);
  ctx.lineTo(19, 25);
  ctx.lineTo(16, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Coat fluffy hem
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.roundRect(-19, 20, 38, 6, 3);
  ctx.fill();
  ctx.stroke();

  // Scarf
  ctx.fillStyle = gender === 'boy' ? '#DC2626' : '#FEF3C7';
  ctx.beginPath();
  ctx.roundRect(-14, -5, 28, 8, 4);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.fillStyle = '#FDE6C4';
  ctx.beginPath();
  ctx.arc(0, -19, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.beginPath();
  ctx.arc(-9, -15, 3.2, 0, Math.PI * 2);
  ctx.arc(9, -15, 3.2, 0, Math.PI * 2);
  ctx.fill();

  if (gender === 'boy') {
    // Hair fringe peeking out
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(-6, -26, 4.5, 0, Math.PI);
    ctx.arc(2, -27, 4.5, 0, Math.PI);
    ctx.fill();

    // Blue pom-pom beanie
    ctx.fillStyle = '#1E40AF';
    ctx.beginPath();
    ctx.arc(0, -24, 15, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DBEAFE';
    ctx.beginPath();
    ctx.roundRect(-15.5, -27, 31, 6.5, 3);
    ctx.fill();
    ctx.stroke();

    // Pom-pom
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -40, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Girl twin braids & winter beret
    ctx.fillStyle = '#5C2D16';
    ctx.beginPath();
    ctx.arc(-15, -13, 5, 0, Math.PI * 2);
    ctx.arc(15, -13, 5, 0, Math.PI * 2);
    ctx.arc(-16, -7, 4, 0, Math.PI * 2);
    ctx.arc(16, -7, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bangs
    ctx.beginPath();
    ctx.arc(0, -22, 14.5, Math.PI * 1.08, -Math.PI * 0.08);
    ctx.fill();

    // Berry beret hat with bow
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.ellipse(0, -30, 17, 8, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute cream bow on beret
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(-9, -31, 3.2, 0, Math.PI * 2);
    ctx.arc(-3, -31, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes & Mouth (Normal vs Stunned)
  if (isStunned) {
    // Soot smudge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
    ctx.beginPath();
    ctx.arc(-5, -18, 4.5, 0, Math.PI * 2);
    ctx.arc(6, -16, 4, 0, Math.PI * 2);
    ctx.fill();

    // X dizzy eyes
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.lineTo(-3, -17);
    ctx.moveTo(-3, -22);
    ctx.lineTo(-8, -17);
    ctx.moveTo(3, -22);
    ctx.lineTo(8, -17);
    ctx.moveTo(8, -22);
    ctx.lineTo(3, -17);
    ctx.stroke();

    // Wavy stunned mouth
    ctx.beginPath();
    ctx.arc(0, -11, 3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(-5.5, -19, 2.2, 0, Math.PI * 2);
    ctx.arc(5.5, -19, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-6, -19.8, 0.8, 0, Math.PI * 2);
    ctx.arc(5, -19.8, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Happy smile
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -15, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // === OPEN CLOTH SACK HELD IN FRONT ===
  const sackOpenBoost = player.catchBounceTimer > 0 ? 4 : 0;
  ctx.save();
  ctx.translate(0, 6);

  // Sack body
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-24 - sackOpenBoost * 0.5, -4);
  ctx.quadraticCurveTo(-28, 18, -14, 21);
  ctx.lineTo(14, 21);
  ctx.quadraticCurveTo(28, 18, 24 + sackOpenBoost * 0.5, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sack interior rim (dark warm brown)
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.ellipse(0, -4, 24 + sackOpenBoost * 0.5, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cloth folded cuff & stitch lines
  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(-18, 4);
  ctx.quadraticCurveTo(0, 8, 18, 4);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hands gripping the sack edges
  ctx.fillStyle = gender === 'boy' ? '#EF4444' : '#FEF3C7';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-23, -2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(23, -2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // === STUNNED DIZZY STARS & 3s COUNTDOWN RING ===
  if (isStunned) {
    // Orbiting stars above head
    for (let i = 0; i < 3; i++) {
      const angle = time * 6 + (i * Math.PI * 2) / 3;
      const sx = Math.cos(angle) * 20;
      const sy = -49 + Math.sin(angle) * 5;
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Countdown progress ring
    const ratio = Math.max(0, Math.min(1, player.stunTimer / BOMB_STUN_SECONDS));
    ctx.save();
    ctx.translate(0, -68);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(248, 113, 113, 0.3)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
    ctx.stroke();

    ctx.fillStyle = '#FEE2E2';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(player.stunTimer).toString(), 0, 0.5);
    ctx.restore();
  }

  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.alpha * (p.life / p.maxLife));
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawFloatingPopups(ctx: CanvasRenderingContext2D, popups: FloatingPopup[]): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const pop of popups) {
    const progress = 1 - pop.life / pop.maxLife;
    const alpha = progress < 0.7 ? 1 : Math.max(0, (1 - progress) / 0.3);
    ctx.globalAlpha = alpha;
    ctx.font = `800 ${Math.round(20 * pop.scale)}px "Outfit", "Noto Sans TC", sans-serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#091426';
    ctx.strokeText(pop.text, pop.x, pop.y);
    ctx.fillStyle = pop.color;
    ctx.fillText(pop.text, pop.x, pop.y);
  }
  ctx.restore();
}
