import type { NextPage } from 'next'
import { Main } from 'next/document'
import styled from 'styled-components'
import Othello from './othello'

const HomePage: NextPage = () => {
  return (
    <div>
      <Othello />
    </div>
  )
}
export default HomePage
