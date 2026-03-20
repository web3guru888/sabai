# Thai Compliance Guide / คู่มือการปฏิบัติตามกฎหมายไทย

This guide covers the Thai regulatory requirements relevant to LINE Mini Apps and how Sabai Framework helps you comply.

คู่มือนี้ครอบคลุมข้อกำหนดทางกฎหมายไทยที่เกี่ยวข้องกับ LINE Mini App และวิธีที่ Sabai Framework ช่วยให้คุณปฏิบัติตาม

---

## 1. Age Verification / การยืนยันอายุ

### The Law / กฎหมาย

**พ.ร.บ. ควบคุมเครื่องดื่มแอลกอฮอล์ พ.ศ. 2551**
**Alcoholic Beverage Control Act B.E. 2551 (2008)**

Key requirements:

| Requirement | Details |
|-------------|---------|
| **Minimum age** | **20 years** (not 21 as in the US) |
| **Verification** | Required before viewing or purchasing alcohol |
| **Sale hours** | 11:00–14:00 and 17:00–24:00 only |
| **Advertising** | Restricted — no encouragement of consumption |

### Penalties / บทลงโทษ

- **Selling to minors:** Fine up to ฿10,000 and/or imprisonment up to 1 year
- **Selling outside permitted hours:** Fine up to ฿10,000
- **Advertising violations:** Fine up to ฿500,000 and/or imprisonment up to 1 year

### How Sabai Handles It / วิธีที่ Sabai จัดการ

The `AgeVerification` component from `@sabai/ui`:

```tsx
import { AgeVerification } from '@sabai/ui';

<AgeVerification
  minimumAge={20}
  onVerified={() => setAgeVerified(true)}
/>
```

**Compliance features:**

| Feature | Implementation |
|---------|---------------|
| ✅ Date-of-birth input | Day, month, year selectors with Thai month names |
| ✅ Accurate age calculation | Handles boundary-day logic correctly |
| ✅ Minimum age = 20 | Default matches Thai law (customizable) |
| ✅ Persistent verification | Stored in `localStorage` to avoid re-verification |
| ✅ Bilingual UI | Thai primary, English secondary |
| ✅ Full-screen gate | Users cannot access content without verifying |

### Time-Based Sale Restrictions / ข้อจำกัดเวลาขาย

Sabai provides the compliance gate; time-based restrictions should be implemented in your business logic:

```ts
function isWithinSaleHours(): boolean {
  const now = new Date();
  const hour = now.getHours();

  // Permitted hours: 11:00–14:00 and 17:00–24:00
  return (hour >= 11 && hour < 14) || (hour >= 17 && hour < 24);
}

function CheckoutPage() {
  if (!isWithinSaleHours()) {
    return (
      <ErrorDisplay
        title="นอกเวลาจำหน่าย / Outside Sale Hours"
        message="สามารถสั่งซื้อได้ในช่วงเวลา 11:00–14:00 และ 17:00–24:00 เท่านั้น / Orders only accepted 11:00–14:00 and 17:00–24:00"
      />
    );
  }

  return <div>Checkout content...</div>;
}
```

---

## 2. PDPA Compliance / การปฏิบัติตาม PDPA

### The Law / กฎหมาย

**พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562**
**Personal Data Protection Act B.E. 2562 (2019)**

Thailand's PDPA is modelled after the EU's GDPR. It governs how personal data is collected, used, and stored.

### Key Requirements / ข้อกำหนดหลัก

| Requirement | PDPA Section | Description |
|-------------|:------------:|-------------|
| **Lawful basis** | §24 | Must have a legal basis for processing (consent, contract, etc.) |
| **Explicit consent** | §19 | Consent must be freely given, specific, informed, and unambiguous |
| **No pre-checked boxes** | §19 | Consent checkboxes must not be pre-checked |
| **Clear purpose** | §21 | Each data use purpose must be clearly explained |
| **Withdrawal mechanism** | §19 | Users must be able to revoke consent easily |
| **Data minimization** | §22 | Collect only data necessary for the stated purpose |
| **Retention limits** | §23 | Delete data when the purpose is fulfilled |
| **Breach notification** | §37(4) | Notify authorities within 72 hours of a breach |
| **Audit trail** | §39 | Maintain records of processing activities |

### Penalties / บทลงโทษ

| Penalty Type | Maximum |
|-------------|---------|
| **Administrative fine** | ฿5,000,000 per violation |
| **Criminal penalty** | ฿500,000 fine and/or 1 year imprisonment |
| **Civil damages** | Actual damages + up to 2x punitive damages |
| **Class action** | Available to affected data subjects |

### How Sabai Handles It / วิธีที่ Sabai จัดการ

The `PdpaConsent` component from `@sabai/ui`:

```tsx
import { PdpaConsent } from '@sabai/ui';

<PdpaConsent
  version="1.0"
  items={[
    {
      id: 'data_collection',
      label: 'การเก็บรวบรวมข้อมูล / Data Collection',
      description: 'ยินยอมให้เก็บข้อมูลส่วนบุคคล / Consent to collect data',
      required: true,
    },
    {
      id: 'marketing',
      label: 'การตลาด / Marketing',
      required: false,
    },
  ]}
  onAccept={(record) => {
    // Send to your backend for audit storage
    fetch('/api/consent', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }}
/>
```

**Compliance features:**

| Feature | PDPA Requirement | Implementation |
|---------|-----------------|----------------|
| ✅ No pre-checked boxes | §19 | All checkboxes start unchecked |
| ✅ Required vs optional | §19 | Required items marked with asterisk; button disabled until checked |
| ✅ Clear purpose labels | §21 | Each item has label + description |
| ✅ Timestamped records | §39 | ISO 8601 timestamp in consent record |
| ✅ Version tracking | §39 | Consent form version included in record |
| ✅ Audit-ready output | §39 | `PdpaConsentRecord` suitable for server storage |

### Consent Record Format / รูปแบบบันทึกความยินยอม

The `PdpaConsentRecord` returned by `onAccept`:

```json
{
  "version": "1.0",
  "timestamp": "2026-03-20T10:30:00.000Z",
  "consents": {
    "data_collection": true,
    "marketing": false,
    "third_party": true
  }
}
```

> 💡 **Recommendation:** Store this record on your server with the user's LINE user ID for a complete audit trail.

### What Sabai Does NOT Handle

Sabai provides the consent **collection** UI. You are responsible for:

| Responsibility | Description |
|---------------|-------------|
| **Server-side storage** | Store consent records in a persistent database |
| **Withdrawal mechanism** | Provide a way for users to revoke consent |
| **Data deletion** | Delete user data upon request or when purpose is fulfilled |
| **Breach notification** | Notify the Thai PDPC within 72 hours of a data breach |
| **DPO appointment** | Appoint a Data Protection Officer if required |
| **Cross-border transfers** | Ensure adequate protection for international data transfers |

---

## 3. Additional Considerations / ข้อพิจารณาเพิ่มเติม

### Consumer Protection Act / พ.ร.บ. คุ้มครองผู้บริโภค

If your LINE Mini App is an e-commerce platform:

- Display prices clearly in Thai Baht (฿)
- Include VAT in displayed prices
- Provide clear refund/return policies
- Display seller contact information

### Electronic Transactions Act / พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์

- Electronic contracts are legally binding in Thailand
- Retain transaction records for at least 5 years
- Ensure secure electronic signatures where required

### Anti-Money Laundering (AML) / ป้องกันการฟอกเงิน

For high-value transactions or financial services:

- Know Your Customer (KYC) verification may be required
- Report suspicious transactions to AMLO
- Maintain transaction records

---

## Compliance Checklist / รายการตรวจสอบการปฏิบัติตาม

Use this checklist for your LINE Mini App:

### Alcohol-related Apps 🍺

- [ ] Age verification gate (minimum age 20)
- [ ] Time-based sale restrictions (11:00–14:00, 17:00–24:00)
- [ ] No alcohol advertising/promotion content
- [ ] Clear age-restricted warnings

### All Apps Collecting Personal Data 🔒

- [ ] PDPA consent form before data collection
- [ ] No pre-checked consent boxes
- [ ] Clear, bilingual purpose descriptions
- [ ] Consent version tracking
- [ ] Timestamped consent records stored on server
- [ ] Consent withdrawal mechanism
- [ ] Privacy policy page
- [ ] Data retention policy
- [ ] Breach notification procedure

### E-commerce Apps 🛒

- [ ] Prices displayed in Thai Baht with VAT
- [ ] Clear product descriptions
- [ ] Refund/return policy
- [ ] Seller contact information
- [ ] Order confirmation records
- [ ] Payment receipts

---

## Resources / แหล่งข้อมูล

| Resource | Link |
|----------|------|
| Thai PDPA Official Text | [ratchakitcha.soc.go.th](http://www.ratchakitcha.soc.go.th/) |
| PDPC (Data Protection Commission) | [pdpc.or.th](https://www.pdpc.or.th/) |
| Alcohol Control Board | [thaiantialcohol.com](https://www.thaiantialcohol.com/) |
| LINE Developers Documentation | [developers.line.biz](https://developers.line.biz/en/docs/) |
| LIFF Documentation | [developers.line.biz/en/docs/liff](https://developers.line.biz/en/docs/liff/) |

---

> ⚠️ **Disclaimer / ข้อจำกัดความรับผิดชอบ:** This guide is for informational purposes only and does not constitute legal advice. Consult a qualified Thai legal professional for compliance specific to your application.
>
> คู่มือนี้มีไว้เพื่อข้อมูลเท่านั้น ไม่ถือเป็นคำแนะนำทางกฎหมาย กรุณาปรึกษาผู้เชี่ยวชาญด้านกฎหมายไทยสำหรับการปฏิบัติตามที่เฉพาะเจาะจงกับแอปพลิเคชันของคุณ
