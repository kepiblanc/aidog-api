import { getUniqueCode } from "../common/util";
import Logger from "../common/logger";
import Allocation, { IAllocation } from "../models/allocaction";

// ELIGIBILITY COINS
import aaa from "../data/aaa.json";
import blub from "../data/blub.json";
import cetus from "../data/cetus.json";
import deep from "../data/deep.json";
import fud from "../data/fud.json";
import navx from "../data/navx.json";
import sudeng from "../data/sudeng.json";
import uni from "../data/uni.json";
import others from "../data/others.json";

const ELIGIBILITY_COINS: Set<string>[] = [
  new Set(aaa as string[]),
  new Set(blub as string[]),
  new Set(cetus as string[]),
  new Set(deep as string[]),
  new Set(fud as string[]),
  new Set(navx as string[]),
  new Set(sudeng as string[]),
  new Set(uni as string[]),
  new Set(others as string[])
];

export interface AllocationPayload {
  address: string;
  referred_by?: string;
}

export default class ModuleService {
  private logger: Logger;
  private defaults = {
    totalAllocation: 500000000,
    rewardPerAllocation: 10000,
    rewardPerReferral: 500,
    reservedAllocation: 0
  };

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  async getAllocation(payload: AllocationPayload) {
    const { address, referred_by } = payload;
    const referralCode = getUniqueCode(6, "alphanumeric");
    let isEligible = await this.isEligible(address);

    const allocaction = await Allocation.findOne({ address: { $regex: new RegExp(`^${address}$`, 'i') }});

    const isSelfReferral = referred_by?.toLowerCase() === allocaction?.referralCode?.toLowerCase();
    
    const allocation = await Allocation.findOneAndUpdate(
      { address: { $regex: new RegExp(`^${address}$`, 'i') } },
      { $setOnInsert: { 
        address,
        referralCode, 
        eligibilityChecked: true,
        eligible: isEligible,
        ...((referred_by && !isSelfReferral) && { referredBy: referred_by })
      }},
      { upsert: true, new: true, lean: true }
    );

    if(!allocation) {
      throw new Error("Unable to get allocation");
    }

    return this.parseResponse(allocation as IAllocation);
  }

  async postAllocation(payload: { address: string }) {
    const { address } = payload;

    const downlineAllocation = await Allocation.findOne({ address: { $regex: new RegExp(`^${address}$`, 'i') } });
    if(!downlineAllocation) {
      throw new Error("Account not found for allocation");
    }

    if(!downlineAllocation?.eligibilityChecked) {
      throw new Error("Eligibility check not completed");
    }

    if(!downlineAllocation?.eligible) {
      throw new Error("Account not eligible for allocation");
    }

    if(downlineAllocation?.reserved) {
      throw new Error("Allocation already reserved");
    }

    downlineAllocation.reserved = true;
    downlineAllocation.totalAllocated = this.defaults.rewardPerAllocation;
    await downlineAllocation.save();

    if(downlineAllocation?.referredBy) {
      const uplineAllocation = await Allocation.findOne({ 
        referralCode: { $regex: new RegExp(`^${downlineAllocation.referredBy}$`, 'i') } 
      });
      
      if(uplineAllocation) {
        uplineAllocation.referralBonus += this.defaults.rewardPerReferral;
        uplineAllocation.totalAllocated += this.defaults.rewardPerReferral;
        uplineAllocation.noOfReferrals += 1;
        await uplineAllocation.save();
      }
    }

    return this.parseResponse(downlineAllocation);
  }

  private async isEligible(address: string) {
    const _address = address.toLowerCase();
    return ELIGIBILITY_COINS.some(coinSet => coinSet.has(_address));
  }

  private async parseResponse(allocation: IAllocation) {
    const grossAllocation = await Allocation.aggregate([
      { $match: { eligible: true } },
      { $group: { _id: null, total: { $sum: "$totalAllocated" } } }
    ]);
    
    return {
      eligible: allocation?.eligible || false,
      reserved: allocation?.reserved || false,
      totalAllocated: allocation?.totalAllocated || 0,
      referralBonus: allocation?.referralBonus || 0,
      noOfReferrals: allocation?.noOfReferrals || 0,
      referralLink: `https://aidogs.meme/${allocation?.referralCode}`,
      defaults: {
        ...this.defaults,
        reservedAllocation: grossAllocation?.[0]?.total || 0,
      }
    }
  }
}
