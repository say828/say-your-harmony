import { describe, it, expect } from 'vitest';
import { createBuiltinSkills, getBuiltinSkill, listBuiltinSkillNames } from '../features/builtin-skills/skills.js';

describe('Builtin Skills', () => {
  describe('createBuiltinSkills()', () => {
    it('should return correct number of skills (9)', () => {
      const skills = createBuiltinSkills();
      expect(skills).toHaveLength(9);
    });

    it('should return an array of BuiltinSkill objects', () => {
      const skills = createBuiltinSkills();
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  describe('Skill properties', () => {
    const skills = createBuiltinSkills();

    it('should have required properties (name, description, template)', () => {
      skills.forEach((skill) => {
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('description');
        expect(skill).toHaveProperty('template');
      });
    });

    it('should have non-empty name for each skill', () => {
      skills.forEach((skill) => {
        expect(skill.name).toBeTruthy();
        expect(typeof skill.name).toBe('string');
        expect(skill.name.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty description for each skill', () => {
      skills.forEach((skill) => {
        expect(skill.description).toBeTruthy();
        expect(typeof skill.description).toBe('string');
        expect(skill.description.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty template for each skill', () => {
      skills.forEach((skill) => {
        expect(skill.template).toBeTruthy();
        expect(typeof skill.template).toBe('string');
        expect(skill.template.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Skill names', () => {
    const skills = createBuiltinSkills();

    it('should have valid skill names', () => {
      const expectedSkills = [
        'harmony',
        'ralph-loop',
        'frontend-ui-ux',
        'git-master',
        'ultrawork',
        'analyze',
        'deepsearch',
        'prometheus',
        'review',
      ];

      const actualSkillNames = skills.map((s) => s.name);
      expect(actualSkillNames).toEqual(expect.arrayContaining(expectedSkills));
      expect(actualSkillNames.length).toBe(expectedSkills.length);
    });

    it('should not have duplicate skill names', () => {
      const skillNames = skills.map((s) => s.name);
      const uniqueNames = new Set(skillNames);
      expect(uniqueNames.size).toBe(skillNames.length);
    });
  });

  describe('getBuiltinSkill()', () => {
    it('should retrieve a skill by name', () => {
      const skill = getBuiltinSkill('harmony');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('harmony');
    });

    it('should be case-insensitive', () => {
      const skillLower = getBuiltinSkill('harmony');
      const skillUpper = getBuiltinSkill('HARMONY');
      const skillMixed = getBuiltinSkill('HaRmOnY');

      expect(skillLower).toBeDefined();
      expect(skillUpper).toBeDefined();
      expect(skillMixed).toBeDefined();
      expect(skillLower?.name).toBe(skillUpper?.name);
      expect(skillLower?.name).toBe(skillMixed?.name);
    });

    it('should return undefined for non-existent skill', () => {
      const skill = getBuiltinSkill('non-existent-skill');
      expect(skill).toBeUndefined();
    });
  });

  describe('listBuiltinSkillNames()', () => {
    it('should return all skill names', () => {
      const names = listBuiltinSkillNames();
      expect(names).toHaveLength(9);
      expect(names).toContain('harmony');
      expect(names).toContain('ralph-loop');
      expect(names).toContain('frontend-ui-ux');
      expect(names).toContain('git-master');
      expect(names).toContain('ultrawork');
      expect(names).toContain('analyze');
      expect(names).toContain('deepsearch');
      expect(names).toContain('prometheus');
      expect(names).toContain('review');
    });

    it('should return an array of strings', () => {
      const names = listBuiltinSkillNames();
      names.forEach((name) => {
        expect(typeof name).toBe('string');
      });
    });
  });

  describe('Template strings', () => {
    const skills = createBuiltinSkills();

    it('should have non-empty templates', () => {
      skills.forEach((skill) => {
        expect(skill.template.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have substantial template content (> 100 chars)', () => {
      skills.forEach((skill) => {
        expect(skill.template.length).toBeGreaterThan(100);
      });
    });
  });
});
