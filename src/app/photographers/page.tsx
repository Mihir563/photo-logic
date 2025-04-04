import { redirect } from 'next/navigation'
import React from 'react'

const page = () => {
  
  redirect('/search')
  
  return (
    <div>

    </div>
  )
}

export default page