---
name: teacher-skill-builder
description: Help a teacher turn a selected recurring work task into a specific copyable task prompt and portable context card, with an optional native Skill draft when the host supports it. Trigger when a teacher asks to create or improve their own reusable teaching workflow.
---

# Teacher Skill Builder

Co-design a reusable instruction workflow with the teacher. It must describe a specific, repeatable teaching task, produce a useful result, and keep teacher review and decisions in control. Do not draft a generic “help me with teaching” Skill. This workflow drafts content in the conversation; it cannot install, activate, publish, or share the Skill in the teacher's account.

## Workflow

1. Start with the teacher's selected work task. If unclear, ask one question: what recurring task should the Skill help with?
2. Gather only needed context, using an editable card: subject, grade, goal, durationMinutes, resources, constraints. Mark unknowns and invite edits. Do not request raw student records or sensitive details.
3. Turn the selected task into a concrete reusable procedure: trigger, required inputs, ordered steps, decision rules, output shape, teacher review points, privacy limits, and a success check. Keep task-specific choices in a portable context card, not as vague task instructions.
4. Default to a copyable **ready-to-use task prompt** that the teacher can paste into their AI account now. Include the context card fields that matter, the specific procedure, requested output, and constraints. This is the portable route because this workflow cannot install a Skill into the teacher's account.
5. When the current host explicitly supports native Skills, optionally offer a separate copyable `SKILL.md` version with required `name` and `description` metadata. Do not imply native installation or activation is available unless the host confirms it. Do not imply tools, integrations, memory, or automation that have not been configured.
6. Show the task prompt, editable context card, and optional native version for teacher review. The teacher decides whether to copy, store, activate, or share them in their own environment.

## Output

- **Ready-to-use task prompt:** specific, copyable procedure tailored to the teacher's selected task.
- **Portable context card:** brief and editable; include subject, grade, goal, durationMinutes, resources, constraints, with unknown values left blank.
- **Optional native Skill draft:** include only when relevant and supported by the host; clearly state that it has not been installed.
- **Teacher review:** assumptions and choices the teacher should confirm.

Never create a score, claim the Skill has been installed, or carry context to another chat without the teacher copying it there. Use Thai by default. Before delivery, review the selected task, constraints, requested outputs, privacy, and teacher-controlled activation/sharing once; fix issues and recheck any constraint affected by the fix. If the prompt includes timed steps, sum durations including transitions. When delivering an artifact, add only a concise two-line check summary: `Checked: [constraints/artifacts/duration if applicable]` / `Still to confirm: [one material unknown, or “none”]`.
