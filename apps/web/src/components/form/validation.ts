import { RegisterOptions, ValidationRule } from 'react-hook-form';

type Rules = Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;

const patterns = {
  email: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email',
  },
  discountCode: {
    value: /^[A-Z0-9]{5,}$/,
    message: 'Invalid promo code',
  },
} as const satisfies Record<string, ValidationRule<RegExp>>;

type Pattern = keyof typeof patterns;
class Validation {
  rules: Rules = {};

  build() {
    return this.rules;
  }

  required(value?: boolean): Validation {
    this.rules.required = {
      value: value === undefined ? true : value,
      message: 'Required',
    };
    return this;
  }

  minLength(value: number): Validation {
    this.rules.minLength = {
      value,
      message: `Minimum ${value} Characters`,
    };
    return this;
  }

  maxLength(value: number): Validation {
    this.rules.maxLength = {
      value,
      message: `Maximum ${value} Characters`,
    };
    return this;
  }

  pattern(key: Pattern): Validation {
    this.rules.pattern = patterns[key];
    return this;
  }

  min(value: number): Validation {
    this.rules.min = {
      value,
      message: `Should be greater than or equal to ${value}`,
    };
    return this;
  }

  max(value: number): Validation {
    this.rules.max = {
      value,
      message: `Should be less than or equal to ${value}`,
    };
    return this;
  }

  positive(): Validation {
    this.rules.validate = {
      positive: (value: string) => (Number(value) > 0 ? true : 'Should be greater than 0'),
    };
    return this;
  }

  range(min: number, max: number): Validation {
    const message = `Should be between ${min} and ${max}`;
    this.rules.min = {
      value: min,
      message,
    };
    this.rules.max = {
      value: max,
      message,
    };
    return this;
  }

  // not chainable
  password(): Rules {
    return this.minLength(3).maxLength(50).build();
  }

  firstName(): Rules {
    return this.required().minLength(3).maxLength(100).build();
  }

  lastName(): Rules {
    return this.maxLength(100).build();
  }
}

function validation(): Validation {
  return new Validation();
}

export default validation;
