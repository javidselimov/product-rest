# Research: Login cavab vaxtı üzrə username enumeration

Technical Context-də `NEEDS CLARIFICATION` qalmadı; aşağıdakılar dizayn qərarlarıdır.
Mənbə faktlar kodda yoxlanılıb (2026-10-01):

- `AuthController.cs:36-40` — istifadəçi `Username == x && IsActive` ilə axtarılır;
  `User` üzərində `HasQueryFilter(DeletedAt == null)` var (`CbarDbContext.cs:97`). Yəni yox,
  deaktiv və silinmiş hesabların üçü də `user is null` yoluna düşür və `||` sayəsində
  `BCrypt.Verify` çağırılmır.
- `UsersController.cs:84, :143` — yeni hash-lar `workFactor: 12` ilə.
- `db/seed.sql:30` — `admin` istifadəçisinin hash-ı `$2y$12$` (eyni iş faktoru).
- `BCrypt.Net-Next` 4.2.0 — `Verify` hash-ın prefiksindən (`$2a$/$2b$/$2y$`) və iş faktorundan
  oxuyur; xərc yalnız iş faktorundan asılıdır.

## R1 — Bərabərləşdirmə üsulu: dummy hash-a qarşı həqiqi `Verify`

- **Decision**: İstifadəçi tapılmayanda `BCrypt.Verify(request.Password, DummyHash)` çağırılır;
  nəticə hesablanır, amma qərarda yalnız `user is not null && verified` istifadə olunur.
- **Rationale**: Xərc mexanizmi real yolla **eynidir** (eyni alqoritm, eyni iş faktoru), ona
  görə server yükü, CPU tipi və ya iş faktoru dəyişsə də iki yol avtomatik bərabər qalır.
  Review-un tövsiyəsi də budur.
- **Alternatives considered**:
  - *Sabit gecikmə (`Task.Delay(250)`)* — real bcrypt vaxtı server yükü və hardware ilə dəyişir,
    sabit ədəd onu izləmir; üstəlik CPU-nu boşaldır, yəni yük altında fərq geri qayıdır.
  - *Təsadüfi 0.3–0.8 s gecikmə (köhnə Yii2 davranışı)* — fərqi yox etmir, yalnız səs-küy
    qatır; kifayət sayda sorğu ilə median fərq yenə görünür. Spec Assumptions-da rədd edilib.
  - *Bütün cavabları sabit minimal müddətə qədər doldurmaq* — işləyir, amma əlavə vəziyyət və
    tuning tələb edir; 1 SP-lik task üçün artıqdır.

## R2 — İş faktoru: tək sabit, iki istifadəçi

- **Decision**: `PasswordHashing.WorkFactor = 12` sabiti yaradılır; `UsersController`-in iki
  `HashPassword` çağırışı və dummy hash onu istifadə edir.
- **Rationale**: Dummy hash-ın xərci real hash-larla eyni olmalıdır. Kimsə gələcəkdə yeni
  parolların iş faktorunu (məsələn 13-ə) qaldırsa və dummy 12-də qalsa, fərq ~2× olur və
  enumeration səssizcə geri qayıdır. Tək sabit bunu struktur olaraq qadağan edir.
- **Alternatives considered**:
  - *Dummy-də ayrıca `12` yazmaq* — bugün düzdür, amma iki hardcoded dəyərin ayrılması məhz
    qarşısını aldığımız regresiya növüdür.
  - *İş faktorunu konfiqurasiyaya (`appsettings`) çıxarmaq* — tələb yoxdur; əlavə Vault/Helm
    dəyəri deməkdir. Lazım olsa sonra sabitin yerini dəyişmək kifayətdir.

## R3 — Dummy hash-ın yaradılması

- **Decision**: `static readonly string DummyHash = BCrypt.HashPassword(<təsadüfi 32 bayt base64>, WorkFactor)` —
  tip ilk dəfə istifadə olunanda (ilk login sorğusunda) bir dəfə hesablanır.
- **Rationale**:
  - Parol məlum deyil və hər prosesdə fərqlidir → mənbə kodda "sehrli" hash və ona uyğun parol
    yoxdur. Bununla belə FR-004-ü təmin edən dummy-nin sirri deyil, qərar məntiqidir (R4).
  - İş faktoru avtomatik `WorkFactor`-dan gəlir (R2); hardcoded hash sətri bunu itirərdi.
  - Bir dəfəlik ~250 ms xərc prosesin ilk login-inə düşür; sonra pulsuzdur.
- **Alternatives considered**:
  - *Mənbədə sabit hash sətri* — ilk sorğuda xərc yoxdur, amma iş faktoru sabitdən ayrılır (R2-nin
    pozuntusu).
  - *Startup-da (`Program.cs`) qızdırmaq* — ilk sorğunun 250 ms-ni aradan qaldırır, amma əlavə
    toxunuş nöqtəsidir; prosesin ilk login-i vaxt ölçümünə təsir etmir (median), lazım deyil.
  - *Hər sorğuda yeni hash* — xərci ikiqat edir (Hash + Verify), yol yenə qeyri-bərabər olur.

## R4 — Qərar məntiqinin forması

- **Decision**: Əvvəlcə `verified = BCrypt.Verify(request.Password, user?.PasswordHash ?? DummyHash)`,
  sonra `if (user is null || !verified)` → bugünkü 401 + log. Short-circuit artıq bcrypt-i
  ötürə bilmir, çünki `Verify` şərtdən əvvəl ayrıca ifadədədir.
- **Rationale**: Dummy-ə qarşı `Verify` təsadüfən `true` qaytarsa belə (praktiki olaraq mümkün
  deyil), `user is null` girişi rədd edir — FR-004 struktur olaraq təmin olunur. Cavab obyekti,
  log mətni və status bugünkü kimi qalır (FR-003, FR-005).
- **Alternatives considered**: *`if` daxilində ternary* — işləyir, amma `||`-in short-circuit
  təhlükəsini oxucudan gizlədir; ayrıca dəyişən niyyəti aydın göstərir və bir sətirlik şərh
  "niyə" sualına cavab verir.

## R5 — Kilidli hesab və #2 ilə əlaqə

- **Decision**: Bu feature kilid yoxlamasının yerinə (`AuthController.cs:47`) toxunmur.
- **Rationale**: Lock oracle-ı #2-nin əhatəsidir (spec Edge Cases). Bu dəyişiklik kilidli
  hesablar üçün vaxtı dəyişmir: onlar bugün də tam `Verify` keçir. #2 eyni MR-da edilərsə,
  onun "kilidi parol yoxlamasından əvvəl yoxlamaq" düzəlişi kilidli hesabda da `Verify`-ın
  çağırılmasını saxlamalıdır, yoxsa həmin ~250 ms-lik fərq kilidli hesablar üçün yenidən
  yaranır. Bu qeyd tasks.md-də #2 ilə birləşmə xəbərdarlığı kimi təkrarlanacaq.

## R6 — Ölçmə metodologiyası

- **Decision**: `curl -w '%{time_total}'` ilə hər qrupa 30 sorğu, növbələşdirilmiş (A, B, C, A, B, C…)
  sıra ilə, median müqayisəsi; **deploy-dan əvvəl baseline** eyni skriptlə ölçülür.
- **Rationale**: Növbələşdirmə şəbəkə/yük dalğalanmasını qruplar arasında bərabər paylayır;
  median tək-tük gecikmələrə davamlıdır. Baseline ~250 ms fərqin həqiqətən mövcud olduğunu
  sübut edir — yoxsa "düzəldi" iddiası boş olar (layihə qaydası: əvvəl ölç, sonra iddia et).
- **Alternatives considered**: *Orta qiymət* — bir neçə yavaş sorğu (TLS, cold start) nəticəni
  pozur. *Lokal ölçüm* — .NET SDK lokalda yoxdur; `test` mühiti həm də real ingress yolunu
  əks etdirir.
