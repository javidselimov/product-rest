# Specification Quality Checklist: Admin login-də brute-force qoruması (lockout, rate limit, lock oracle)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-02
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Üç sual 2026-10-02-də cavablandırıldı (spec → Clarifications): Q1 — kilidli hesab
  `Invalid credentials.` qaytarır; Q2 — sabit kilid, 10 dəqiqədə 5 cəhd → 15 dəqiqə; Q3 — IP limiti
  #5-dən sonra ayrıca task, bu spec-də yalnız ad üzrə limit.
- Plan mərhələsində həll olundu: 10 dəqiqəlik pəncərə üçün yeni nullable sütun
  `last_failed_login_at` (research R1); spec-in Əhatə, Key Entities və Assumptions bölmələri
  buna uyğun yeniləndi.
- `Input` sətri istifadəçinin mətnini olduğu kimi saxlayır (`AddRateLimiter`, `AuthController.cs:47`).
  Spec-in özü həll yolunu təsvir etmir; texnika plan mərhələsinə qalır.
- Proyekt adları, `product-host` istinadı və OpenAPI-yə istinad Konstitusiyanın tələbidir
  (Maddə I.2, II.3) və spec-first qaydasıdır; əhatə dairəsini müəyyən edir, implementasiya
  detalı sayılmır.
- SC-002-dəki ms həddi hücumçunun ölçə biləcəyi xarici siqnaldır, daxili metrika deyil.
- CAPTCHA açıq şəkildə "ləğv edilir / Phase 2" kimi qeyd olunub (Maddə I.3, paritet cədvəli).
