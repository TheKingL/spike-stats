import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Division from './pages/Division'
import Team from './pages/Team'
import Compare from './pages/Compare'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="division/:gradeId" element={<Division />} />
        <Route path="team/:teamName" element={<Team />} />
        <Route path="compare" element={<Compare />} />
      </Route>
    </Routes>
  )
}
