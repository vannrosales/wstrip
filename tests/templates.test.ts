import { describe, it, expect } from 'vitest';
import { TEMPLATES, FILTERS, STICKERS } from '../lib/templates';
import { getSocialShareLinks } from '../lib/share';

describe('wStrip Templates System', () => {
  it('every template must have slots.length === shots', () => {
    for (const template of TEMPLATES) {
      expect(
        template.slots.length,
        `Template "${template.id}" has slots length ${template.slots.length} but shots is ${template.shots}`
      ).toBe(template.shots);
    }
  });

  it('every template must have positive dimensions and valid slots', () => {
    for (const template of TEMPLATES) {
      expect(template.size.width).toBeGreaterThan(0);
      expect(template.size.height).toBeGreaterThan(0);

      for (let i = 0; i < template.slots.length; i++) {
        const slot = template.slots[i];
        expect(slot.w).toBeGreaterThan(0);
        expect(slot.h).toBeGreaterThan(0);
        expect(slot.x + slot.w).toBeLessThanOrEqual(template.size.width);
        expect(slot.y + slot.h).toBeLessThanOrEqual(template.size.height);
      }
    }
  });

  it('all template IDs must be unique', () => {
    const ids = TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all filter IDs and sticker IDs must be unique', () => {
    const filterIds = FILTERS.map((f) => f.id);
    expect(new Set(filterIds).size).toBe(filterIds.length);

    const stickerIds = STICKERS.map((s) => s.id);
    expect(new Set(stickerIds).size).toBe(stickerIds.length);
  });

  it('getSocialShareLinks generates valid URLs', () => {
    const links = getSocialShareLinks('https://wstrip.vercel.app', 'Test');
    expect(links.facebook).toContain('facebook.com');
    expect(links.whatsapp).toContain('whatsapp.com');
    expect(links.twitter).toContain('twitter.com');
    expect(links.telegram).toContain('t.me');
  });
});

