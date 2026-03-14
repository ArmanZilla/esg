# Social Impact Dashboard (ESG - Social)

A full-stack web dashboard for university social KPIs with real-time updates from Excel uploads.


## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```




## Excel Template

Download from Admin Panel or use `sample.xlsx`. Workbook sheets:

| Sheet | Required Columns | Optional Columns |
|-------|-----------------|-----------------|
| meta | year | period, university_name, uploaded_by |
| gender | year, faculty, group_type, male_pct, female_pct | other_pct, women_leadership_pct, pay_gap_pct |
| engagement | year, faculty, satisfaction_pct | nps, club_participation_pct, avg_activities_per_student |
| volunteering | year, faculty, volunteers_students, volunteers_staff, total_hours, projects_count | top_direction |
| esg_courses | year, faculty, courses_count | esg_students_pct, green_program_students |

## Project Structure

```
├── backend/
│   ├── main.py              
│   ├── config.py         
│   ├── database.py          
│   ├── models.py            
│   ├── auth.py              
│   ├── excel_parser.py      
│   ├── template_generator.py 
│   ├── events.py            
│   ├── generate_sample.py   
│   ├── sample.xlsx          
│   └── routers/
│       ├── admin.py         
│       ├── public.py        
│       └── realtime.py      
├── frontend/
│   └── src/
│       ├── api.ts           
│       ├── context/         
│       ├── hooks/          
│       ├── components/     
│       └── pages/           
├── docker-compose.yml
└── README.md
```
