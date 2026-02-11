export type SignUpDto = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type LoginDto = {
  email: string;
  password: string;
};
