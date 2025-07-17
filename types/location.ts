export type Country = {
  id: string
  code: string
  code3: string
  name: string
  nameLocal: string
  phoneCode: string
  currency: string
}

export type State = {
  id: string
  countryCode: string
  code: string
  name: string
  nameLocal: string | null
}

export type City = {
  id: string
  stateId: string
  name: string
  nameLocal: string | null
}