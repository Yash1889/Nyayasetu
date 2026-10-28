import { NextResponse } from "next/server";
import pathwaysData from "@/data/procedural_pathways.json";
import { ProceduralPathway, ProceduralStep } from "@/lib/types";

const pathways: ProceduralPathway[] = pathwaysData as ProceduralPathway[];

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pathwayId = searchParams.get("pathway_id");

  if (pathwayId) {
    const found = pathways.find(p => p.id === pathwayId);
    if (!found) {
      return NextResponse.json({ error: "Pathway not found" }, { status: 404 });
    }
    return NextResponse.json(found);
  }

  return NextResponse.json({
    total: pathways.length,
    pathways: pathways.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      governing_statutes: p.governing_statutes,
      forum: p.forum
    }))
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pathway_id, sender_name, recipient_name, claim_amount, dispute_details, date_of_incident } = body;

    const pathway = pathways.find(p => p.id === pathway_id);
    if (!pathway) {
      return NextResponse.json({ error: "Invalid pathway_id provided" }, { status: 400 });
    }

    // Build structured legal demand notice draft
    const formattedDate = date_of_incident || new Date().toLocaleDateString("en-IN");
    let noticeDraft = "";

    if (pathway_id === "pathway_cheque_bounce") {
      noticeDraft = `STATUTORY LEGAL DEMAND NOTICE
(UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881)

Date: ${new Date().toLocaleDateString("en-IN")}
SENT VIA REGISTERED POST WITH A/D / SPEED POST

To:
${recipient_name || "[Name of Cheque Drawer / Accused]"}
[Address of Recipient]

From:
${sender_name || "[Name of Payee / Complainant]"}
[Address of Complainant]

SUB: STATUTORY DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR PAYMENT OF CHEQUE AMOUNT OF ₹${claim_amount || "[Amount]"}

Sir/Madam,

Under instructions and on behalf of my client / undersigned, I hereby serve upon you this Statutory Legal Demand Notice:

1. That in discharge of your legally enforceable debt/liability, you issued Cheque No. [Cheque Number] dated ${formattedDate} drawn on [Bank Name, Branch] for an amount of ₹${claim_amount || "[Amount]"} in favour of the undersigned.

2. That the said cheque was presented by the undersigned to their banker, but the same was returned unpaid by the bank vide official Bank Return Memo dated [Memo Date] with the endorsement: "FUNDS INSUFFICIENT" / "EXCEEDS ARRANGEMENT".

3. That the dishonour of the said cheque has taken place in violation of Section 138 of the Negotiable Instruments Act, 1881.

4. You are hereby called upon through this Statutory Notice to make full payment of the cheque amount of ₹${claim_amount || "[Amount]"} to the undersigned within 15 (FIFTEEN) DAYS from the date of receipt of this notice.

5. Please take note that if you fail to make payment within the aforesaid statutory period of 15 days, my client shall be constrained to initiate criminal proceedings against you under Section 138 and Section 142 of the Negotiable Instruments Act, 1881 before the competent Judicial Magistrate, wherein you shall be liable to be prosecuted and punished with imprisonment for a term which may extend to two years, or with fine up to twice the amount of the cheque, or both, alongside interim compensation under Section 143A.

Yours faithfully,

${sender_name || "[Complainant Signature]"}
[Contact Details]`;
    } else {
      noticeDraft = `PRE-LITIGATION LEGAL GRIEVANCE & DEMAND NOTICE

Date: ${new Date().toLocaleDateString("en-IN")}
SENT VIA REGISTERED POST / ELECTRONIC MAIL

To:
${recipient_name || "[Name of Counter-Party / Entity]"}
[Address of Recipient]

From:
${sender_name || "[Name of Claimant / Consumer]"}
[Address of Claimant]

SUB: PRE-LITIGATION DEMAND NOTICE IN RESPECT OF: ${pathway.title}

Sir/Madam,

1. That the undersigned entered into a transaction/agreement on or about ${formattedDate} regarding:
${dispute_details || "[Factual summary of goods, services, or tenancy dispute]"}

2. That despite lawful obligations under ${pathway.governing_statutes.join(", ")}, you have committed a breach and deficiency causing substantial monetary loss and hardship to the tune of ₹${claim_amount || "[Claim Amount]"}.

3. You are hereby formally called upon to rectify the aforesaid deficiency / refund the sum of ₹${claim_amount || "[Claim Amount]"} within 15 (FIFTEEN) DAYS of the receipt of this notice.

4. Failing compliance within the stipulated 15 days, the undersigned shall initiate formal proceedings before the ${pathway.forum} for restitution, compensation, and litigation costs, entirely at your risk and consequence.

Yours faithfully,

${sender_name || "[Claimant Signature]"}`;
    }

    return NextResponse.json({
      pathway: pathway.title,
      forum: pathway.forum,
      statutes: pathway.governing_statutes,
      checklist: pathway.procedural_steps.map(s => ({
        step: s.step_number,
        title: s.title,
        deadline: s.statutory_deadline,
        evidence: s.evidence_required
      })),
      notice_draft: noticeDraft
    });
  } catch (err) {
    console.error("Checklist POST error:", err);
    return NextResponse.json({ error: "Failed to generate checklist notice draft" }, { status: 500 });
  }
}
