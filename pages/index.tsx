import type { NextPage } from 'next'
import { Main } from 'next/document'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledSquare = styled.button`
  background-color: green;
  padding: 10px;
  width: 75px;
  height: 75px;
  display: grid;
`

const BlackSquare = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: black;
`

const WhiteSquare = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
`
const TempSquare = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: yellow;
`
export enum SquareType {
  Undef = 0,
  White = 1,
  Black = 2,
  Temp = 3,
}

export const Square = (props: {
  color: SquareType
  onClick: (x: number, y: number) => void
  x: number
  y: number
}) => {
  //分割代入でpropsを展開
  const { color, onClick, x, y } = props
  return (
    <StyledSquare onClick={() => onClick(x, y)}>
      {
        //TODO 三項演算子これでいいか確認する そもそもSquareTypeを使わない可能性が高い
        color === SquareType.Undef ? (
          ''
        ) : color === SquareType.Black ? (
          <BlackSquare />
        ) : color === SquareType.White ? (
          <WhiteSquare />
        ) : (
          <TempSquare />
        )
      }
    </StyledSquare>
  )
}

const Container = styled.div`
  display: grid;
  width: 600px;
  height: 600px;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  position: absolute;
  background-color: green;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
// Mainareaは良い変数名ではない
const Mainarea = styled.div`
  width: 75px;
  height: 75px;
  border: 1px solid black;
`
// 1を白,2を黒,0を未配置と想定 これをSquareTypeと関連付けているはず
const InitialBoardData = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 0, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

//クリックしたセルの情報とボードの情報を渡す
const CheckCanput = (
  x: number,
  y: number,
  color: number,
  board: number[][]
) => {
  const direction = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ]
  const playercolor = color
  console.log('playercolor', playercolor)
  //「ひっくり返せることが確定した」石のリスト
  let results: number[][] = []

  //そもそものループ
  for (let i = 0; i < 8; i++) {
    //ひっくり返せるかもしれないやつを仮で入れるやつ
    const tempcells: number[][] = []
    const dx = x + direction[i][0]
    const dy = y + direction[i][1]
    //盤面の外に出ていないかチェック
    if (dx < 0 || dx > 7 || dy < 0 || dy > 7) {
      continue
    }
    //隣のセルが同じ色or0なら次のループへ
    if (
      board[y + direction[i][1]][x + direction[i][0]] === 0 ||
      board[y + direction[i][1]][x + direction[i][0]] === playercolor
    ) {
      continue
    }
    tempcells.push([y + direction[i][1], x + direction[i][0]])

    //
    for (let j = 0; j < 7; j++) {
      //走査している隣のセル
      const nextx = x + direction[i][0] * (j + 1)
      const nexty = y + direction[i][1] * (j + 1)
      //もし盤面外なら次のループへ
      if (nextx < 0 || nextx > 7 || nexty < 0 || nexty > 7) {
        continue
      }
      //もし調べたセルが0なら次のループへ
      if (board[nexty][nextx] === 0) {
        continue
      }
      //もし調べたセルが自分の色ならresultsにtempcellsを追加して終わる
      if (board[nexty][nextx] === color) {
        results = results.concat(tempcells)
        break
      } else {
        tempcells.push([nexty, nextx])
      }
    }
  }
  console.log('results', results)
  return results
}

//ターン開始時に既存セルの隣接マスに置けるかチェックする
//置けるならそのセルをハイライトする
//置けないならパスする
//もし２連続パスならゲーム終了

const HomePage: NextPage = () => {
  //変数boardに初期値のInitialBoardDataを代入 setboardが変数boardを更新する関数
  const [board, setBoard] = useState(InitialBoardData)
  //変数turnに初期値を代入
  const [turn, setTurn] = useState(1)
  //変数IsLastPassに初期値を代入
  const [IsLastPass, setIsLastPass] = useState(false)
  //変数IsGameEndに初期値を代入 Trueになったらゲーム終了
  const [IsGameEnd, setIsGameEnd] = useState(false)
  useEffect(() => {
    const playercolor = turn % 2 === 0 ? 1 : 2
    let CanputList: number[][] = []
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        //もしセルが0ならcontinueで次のループへ
        CanputList = CanputList.concat(CheckCanput(i, j, playercolor, board))
      }
    }
    if (IsGameEnd === true) {
      let blackcount = 0
      let whitecount = 0
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (board[i][j] === 1) {
            blackcount++
          } else if (board[i][j] === 2) {
            whitecount++
          }
        }
      }
      //Canputlistに要素を追加してif (CanputList.length === 0)を回避している。
      if (blackcount > whitecount) {
        setBoard(InitialBoardData)
        alert('黒の勝ちです')
        CanputList.push([-1, -1])
      } else if (blackcount < whitecount) {
        setBoard(InitialBoardData)
        alert('白の勝ちです')
        CanputList.push([-1, -1])
      } else {
        setBoard(InitialBoardData)
        alert('引き分けです')
        CanputList.push([-1, -1])
      }
    }
    if (CanputList.length === 0) {
      console.log(CanputList)
      alert('置けるマスがありません！パスします')
      setTurn(turn + 1)
      //もし、前のターンもパスだったらゲーム終了
      if (IsLastPass === true) {
        setIsGameEnd(true)
        //Canputlistを追加して無理やり条件を外す
      } else {
        setIsLastPass(true)
      }
    }
  }, [IsGameEnd, IsLastPass, board, turn])

  return (
    <Container>
      {board.map((row: number[], i: number) => {
        return row.map((stone: number, j: number) => {
          return (
            <Mainarea key={`${i}-${j}`}>
              <Square
                //jがx,iがyに留意する
                x={j}
                y={i}
                color={board[i][j]}
                onClick={(x: number, y: number) => {
                  const playercolor = turn % 2 === 0 ? 1 : 2
                  //もし、クリックした位置に石があればアラートを出すだけ
                  if (CheckCanput(x, y, playercolor, board).length === 0) {
                    console.log(CheckCanput(x, y, playercolor, board))
                    alert('そこには置けません')
                  }
                  //そうで無いなら、そこに置けるかどうか調べて、ひっくり返す
                  else {
                    const filplist = CheckCanput(x, y, playercolor, board)
                    const newboard = board
                    for (let i = 0; i < filplist.length; i++) {
                      const filp = filplist[i]
                      newboard[filp[0]][filp[1]] = playercolor
                      setBoard(newboard)
                    }
                    newboard[y][x] = playercolor
                    setTurn(turn + 1)
                    setIsLastPass(false)
                  }
                }}
              />
            </Mainarea>
          )
        })
      })}
      <p>ターン:{turn}</p>
      <p>手番:{turn % 2 === 0 ? '白' : '黒'}</p>
      <button
        onClick={() => {
          setTurn(turn + 1)
        }}
      >
        パス
      </button>
      <button
        onClick={() => {
          setBoard(InitialBoardData)
          setTurn(1)
        }}
      >
        はじめから
      </button>
    </Container>
  )
}
export default HomePage
