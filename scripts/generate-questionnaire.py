"""Build standard AcroForm questionnaire: .venv/bin/pip install -r scripts/pdf-requirements.txt"""
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from pypdf import PdfReader

out=Path('public/faculty/saath-fillable-questionnaire.pdf')
questions=json.loads(Path('public/faculty/questionnaire.json').read_text())
c=canvas.Canvas(str(out), pagesize=(595,842))
c.setTitle('Saath — fillable reflection worksheet (non-clinical prototype)')
def text(x,y,value,size=10):
    c.setFillColor(HexColor('#203c36')); c.setFont('Helvetica',size); c.drawString(x,y,value)
def field(name,label,y,height=27,multiline=False):
    text(42,y,label)
    c.acroForm.textfield(name=name,tooltip=label,x=42,y=y-height-8,width=510,height=height,fontSize=10,borderWidth=1,borderColor=HexColor('#93aaa1'),fillColor=white,fieldFlags='multiline' if multiline else '',maxlen=1600 if multiline else 120)
def header(title):
    text(42,805,'SAATH / OFFLINE REFLECTION WORKSHEET',12)
    text(42,779,title,19)
    text(42,756,'Prototype only. Not a diagnosis, treatment, or monitored support service.',10)
def footer(n):
    text(42,44,'For urgent support in India: Tele-MANAS 14416; immediate danger: 112.',10)
    text(42,28,f'Private responses: save securely. No automatic upload. Page {n}/11.',9)
header('Before you begin')
lines=[
 'This English worksheet complements the app; it does not run the application.',
 'Use a pseudonym. Do not enter passwords, contact details or backup passphrases.',
 'All questions are optional. Skip anything you do not want to answer.',
 'Use Adobe Acrobat Reader or another reader supporting standard AcroForms.',
 'After filling, choose Save As, close, reopen and verify responses are still visible.',
 'Browser/mobile readers vary. Test a copy before collecting responses.',
 'Sharing this file shares its contents in plaintext; use a secure approved channel.',
 'No scores, diagnosis or automatic crisis detection are performed by this PDF.',
 'If a question brings up distress, pause and contact a trusted person or support.',
 'Days 1-7 mirror app journal prompts. Days 8-10 are extra follow-up worksheets.',
 'Sleep, meals and CBT fields below are worksheet additions, not existing app screens.'
]
for i,line in enumerate(lines):text(42,718-i*23,line,10)
field('participant_code','Pseudonym / participant code (optional)',420)
text(42,345,'Record type (choose one):')
for i,(value,label) in enumerate([('simulation','Simulated testing record'),('personal','Personal practice record')]):
 c.acroForm.radio(name='record_type',tooltip='Record type',value=value,x=42,y=313-i*28,buttonStyle='circle',selected=False)
 text(70,318-i*28,label)
c.acroForm.checkbox(name='privacy_read',tooltip='I read the privacy and save instructions',x=42,y=225,buttonStyle='check')
text(70,230,'I have read the privacy and saving instructions (optional).')
footer(1);c.showPage()
for d in range(1,11):
 q=questions[min(d-1,6)]
 header(f'Day {d}'+(' - follow-up (outside app journal)' if d>7 else ' - daily reflection'))
 field(f'd{d}_date','Date (YYYY-MM-DD)',726)
 prompt=q['en'] if d<=7 else 'What would you like to carry forward today?'
 text(42,654,prompt,12)
 text(42,636,'Choose one.' if d==1 else 'Choose any that fit. If choosing an exclusive option, leave others blank.',9)
 for j,o in enumerate(q['options']):
  y=607-j*25
  if d==1:c.acroForm.radio(name=f'd{d}_choice',tooltip=prompt,value=o['id'],x=42,y=y,buttonStyle='circle',selected=False)
  else:c.acroForm.checkbox(name=f'd{d}_{o["id"]}',tooltip=o['en'],x=42,y=y,buttonStyle='check')
  text(70,y+5,o['en']+(' (choose alone)' if o.get('exclusive') else ''),10)
 field(f'd{d}_note','Optional reflection / situation / automatic thought',407,55,True)
 field(f'd{d}_alternative','Evidence and a more balanced alternative thought (optional)',326,55,True)
 field(f'd{d}_step','One manageable action / what happened after trying it (optional)',245,45,True)
 field(f'd{d}_stress','Optional stress before / after (0-10; not a validated scale)',175,24)
 field(f'd{d}_routine','Optional sleep hours / meals (not clinical measures)',117,24)
 footer(d+1); c.showPage()
c.save()
r=PdfReader(str(out));fields=r.get_fields()
assert len(r.pages)==11 and len(fields)>100
assert {'/Tx','/Btn'} <= {v.get('/FT') for v in fields.values()}
print(f'Created {out}: {len(r.pages)} pages, {len(fields)} AcroForm fields')
