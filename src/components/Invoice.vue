<template>
  <router-link class="invoice flex" :to="{  name: 'Invoice', params: { invoiceId: invoice.invoiceId } }">
    <div class="left flex">
      <span class="tracking-number">#{{ invoice.invoiceId }}</span>
      <span class="due-date">
        {{new Date(invoice.paymentDueDate).toLocaleDateString('en-gb', { day: 'numeric', month: 'short', year: 'numeric' })}}
        <br><p v-if="invoice.invoicePending">({{ calculateTimeLeft() }})</p>
      </span>
      <span class="person">{{ invoice.clientName }}</span>
    </div>
    <div class="right flex">
      <span class="price">${{ invoice.invoiceTotal }}</span>
      <div
        class="status-button flex"
        :class="{ paid: invoice.invoicePaid, draft: invoice.invoiceDraft,
        'pending-red': calculatePendingclass() == 'pending-red' && invoice.invoicePending,
        'pending-orange': calculatePendingclass() == 'pending-orange' && invoice.invoicePending,
        'pending-green': calculatePendingclass() == 'pending-green' && invoice.invoicePending}"
      >
        <span v-if="invoice.invoicePaid">Paid</span>
        <span v-if="invoice.invoiceDraft">Draft</span>
        <span v-if="invoice.invoicePending">Pending</span>
      </div>
      <div class="icon">
        <img src="@/assets/icon-arrow-right.svg" alt="" />
      </div>
    </div>
  </router-link>
</template>

<script>
import moment from 'moment';
export default {
  name: "invoice",
  props: ["invoice"],
  methods: {
    // calculate time left until due date, otherwise return overdue
    calculateTimeLeft: function() {
      var now = moment();
      var dueDate = moment(new Date(this.invoice.paymentDueDate));
      var timeLeft = dueDate.diff(now);
      if (timeLeft < 0) {
        return "Overdue";
      } else {
        return moment.duration(timeLeft).humanize();
      }
    },

    // calculate time left in months until due date
    calculateTimeLeftInMonths: function() {
      var now = moment();
      var dueDate = moment(new Date(this.invoice.paymentDueDate));
      var timeLeft = dueDate.diff(now, 'months');
      return timeLeft;
    },
    
    // using calculateTimeLeft, calculate pending class
    // if overdue, return pending-red
    // if less than 2 months, return pending-orange
    // else return pending-green

    calculatePendingclass: function() {
      var timeLeft = this.calculateTimeLeft();
      var timeLeftInMonths = this.calculateTimeLeftInMonths();
      if (timeLeft === "Overdue") {
        return "pending-red";
      } else if (timeLeftInMonths <= 2) {
        return "pending-orange";
      } else {
        return "pending-green";
      }
    }

  }
};
</script>

<style lang="scss" scoped>
.invoice {
  text-decoration: none;
  cursor: pointer;
  gap: 16px;
  margin-bottom: 16px;
  color: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  background-color: #1e2139;
  align-items: center;

  span {
    font-size: 13px;
  }

  .left {
    align-items: center;
    flex-basis: 60%;
    gap: 16px;

    span {
      flex: 1;
    }

    .tracking-number {
      text-transform: uppercase;
    }
  }

  .right {
    gap: 16px;
    flex-basis: 40%;
    align-items: center;
    
    .price {
      flex: 1;
      font-size: 16px;
      font-weight: 600px;
    }
  }
}
</style>