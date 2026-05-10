export const GITHUB_OWNER = 'TheKingL'
export const GITHUB_REPO = 'spike-stats'

export const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`

export const DIVISIONS = [
  {
    id: 'D1M',
    label: 'Div 1',
    gradeId: '2164',
    standingsUrl: 'https://www.volleyballsa.com.au/indoor/savl/tables?grade=2164',
    fixturesUrl: 'https://www.volleyballsa.com.au/indoor/savl/fixtures?grade=2164',
    resultsUrl: 'https://www.volleyballsa.com.au/indoor/savl/results?grade=2164&club=0',
    adelaideUniTeams: ['Adelaide Uni D1M'],
  },
  {
    id: 'D2M',
    label: 'Div 2',
    gradeId: '2165',
    standingsUrl: 'https://www.volleyballsa.com.au/indoor/savl/tables?grade=2165',
    fixturesUrl: 'https://www.volleyballsa.com.au/indoor/savl/fixtures?grade=2165',
    resultsUrl: 'https://www.volleyballsa.com.au/indoor/savl/results?grade=2165&club=0',
    adelaideUniTeams: ['Adelaide Uni D2M'],
  },
  {
    id: 'D3M',
    label: 'Div 3',
    gradeId: '2166',
    standingsUrl: 'https://www.volleyballsa.com.au/indoor/savl/tables?grade=2166',
    fixturesUrl: 'https://www.volleyballsa.com.au/indoor/savl/fixtures?grade=2166',
    resultsUrl: 'https://www.volleyballsa.com.au/indoor/savl/results?grade=2166&club=0',
    adelaideUniTeams: ['Adelaide Uni D3M'],
  },
  {
    id: 'D4M',
    label: 'Div 4',
    gradeId: '2167',
    standingsUrl: 'https://www.volleyballsa.com.au/indoor/savl/tables?grade=2167',
    fixturesUrl: 'https://www.volleyballsa.com.au/indoor/savl/fixtures?grade=2167',
    resultsUrl: 'https://www.volleyballsa.com.au/indoor/savl/results?grade=2167&club=0',
    adelaideUniTeams: ['Adelaide Uni D4M'],
  },
  {
    id: 'D5M',
    label: 'Div 5',
    gradeId: '2168',
    standingsUrl: 'https://www.volleyballsa.com.au/indoor/savl/tables?grade=2168',
    fixturesUrl: 'https://www.volleyballsa.com.au/indoor/savl/fixtures?grade=2168',
    resultsUrl: 'https://www.volleyballsa.com.au/indoor/savl/results?grade=2168&club=0',
    adelaideUniTeams: ['Adelaide Uni A', 'Adelaide Uni B'],
  },
]

export const ADELAIDE_UNI_TEAMS = DIVISIONS.flatMap(d => d.adelaideUniTeams)

export const TEAM_COLORS = {
  'Adelaide Uni A': '#004F9E',
  'Adelaide Uni B': '#FFB81C',
  'Adelaide Uni D1M': '#004F9E',
  'Adelaide Uni D2M': '#004F9E',
  'Adelaide Uni D3M': '#004F9E',
  'Adelaide Uni D4M': '#004F9E',
}

export const DEFAULT_DIVISION_ID = 'D5M'
