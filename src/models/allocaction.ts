import { model, Schema } from 'mongoose';
import { Document } from 'mongoose';

export interface IAllocation extends Document {
  address: string;
  eligible: boolean;
  eligibilityChecked: boolean;
  reserved: boolean;
  totalAllocated: number;
  referralBonus: number;
  noOfReferrals: number;
  referralCode: string;
  referredBy: string;
  created_at: Date;
  updated_at: Date;
}

const AllocationSchema = new Schema(
  {
    address: {
      type: String,
      default: '',
      index: true
    },
    eligible: {
      type: Boolean,
      default: false
    },
    eligibilityChecked: {
      type: Boolean,
      default: false
    },
    reserved: {
      type: Boolean,
      default: false
    },
    totalAllocated: {
      type: Number,
      default: 0
    },
    referralBonus: {
      type: Number,
      default: 0
    },
    noOfReferrals: {
      type: Number,
      default: 0
    },
    referralCode: {
      type: String,
      default: ''
    },
    referredBy: {
      type: String,
      default: ''
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

AllocationSchema.set('toObject', { getters: true });

const Allocation = model<IAllocation>('Allocation', AllocationSchema);

export default Allocation

