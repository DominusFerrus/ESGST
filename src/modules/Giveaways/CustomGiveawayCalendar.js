import Module from '../../class/Module';

class GiveawaysCustomGiveawayCalendar extends Module {
  constructor() {
    super();
    this.info = {
      description: [
        [`ul`, [
          [`li`, [
            `Allows you to customize the calendar for selecting the start/end times of giveaways in the `,
            [`a`, { href: `https://www.steamgifts.com/giveaways/new` }, `new giveaway`],
            ` page.`
          ]],
          [`li`, `Make sure to test if SteamGifts accepts the format you entered by reviewing a test giveaway.`]
        ]]
      ],
      inputItems: [
        {
          id: `cgc_dateFormat`,
          prefix: `Date format: `,
          suffix: ` (check accepted formats here: http://api.jqueryui.com/datepicker/#utility-formatDate)`
        },
        {
          id: `cgc_timeFormat`,
          prefix: `Time format: `,
          suffix: ` (check accepted formats here: https://trentrichardson.com/examples/timepicker/#tp-formatting)`
        }
      ],
      options: [
        {
          title: `First day of the week: `,
          values: [`Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`]
        }
      ],
      id: `cgc`,
      name: `Custom Giveaway Calendar`,
      sg: true,
      type: `giveaways`
    };
  }

  init() {
    if (!this.esgst.newGiveawayPath || !document.getElementsByClassName(`form__rows`)[0]) {
        return;
    }

    const script = document.createElement(`script`);
    script.textContent = `
      if (document.readyState === "complete") {
        esgst_cgc();
      } else {        
        $(window).on("load", function () {
          esgst_cgc();
        });
      }

      function esgst_cgc() {
        $("input[name=start_time]").datetimepicker("destroy");
        $("input[name=start_time]").datetimepicker({
          beforeShowDay: t,
          dateFormat: "${this.esgst.cgc_dateFormat}",
          firstDay: "${this.esgst.cgc_index_0}",
          maxDate: new Date((new Date).getTime() + 2592e6 - 36e5),
          maxDateTime: new Date((new Date).getTime() + 2592e6 - 36e5),
          minDate: new Date,
          minDateTime: new Date,
          numberOfMonths: 1,
          selectOtherMonths: !0,
          showOtherMonths: !0,
          timeFormat: "${this.esgst.cgc_timeFormat}",
          onSelect: function() {
            s()
          },
          onClose: function() {
            s()
          }
        });

        $("input[name=end_time]").datetimepicker("destroy");
        $("input[name=end_time]").datetimepicker({
          beforeShowDay: t,
          dateFormat: "${this.esgst.cgc_dateFormat}",
          firstDay: "${this.esgst.cgc_index_0}",
          maxDate: new Date((new Date).getTime() + 2592e6),
          maxDateTime: new Date((new Date).getTime() + 2592e6),
          minDate: new Date((new Date).getTime() + 36e5),
          minDateTime: new Date((new Date).getTime() + 36e5),
          numberOfMonths: 1,
          selectOtherMonths: !0,
          showOtherMonths: !0,
          timeFormat: "${this.esgst.cgc_timeFormat}",
          onSelect: function() {
            i()
          },
          onClose: function() {
            i()
          }
        });

        function t(e) {
          return (start_time = $("input[name=start_time]").datetimepicker("getDate")) && (end_time = $("input[name=end_time]").datetimepicker("getDate")) ? (start_time.setHours(0, 0, 0, 0), end_time.setHours(0, 0, 0, 0), [!0, e.getTime() >= start_time.getTime() && e.getTime() <= end_time.getTime() ? "datepicker-highlight-range" : ""]) : [!0, ""]
        }

        function s() {
          (start_time = $("input[name=start_time]").datetimepicker("getDate")) && (end_time = $("input[name=end_time]").datetimepicker("getDate")) && (start_time = new Date(start_time.getTime() + 36e5), start_time > end_time && $("input[name=end_time]").datetimepicker("setDate", start_time))
        }

        function i() {
          (start_time = $("input[name=start_time]").datetimepicker("getDate")) && (end_time = $("input[name=end_time]").datetimepicker("getDate")) && (end_time = new Date(end_time.getTime() - 36e5), end_time < start_time && $("input[name=start_time]").datetimepicker("setDate", end_time))
        }
      }
    `;
    document.body.appendChild(script);
    script.remove();
  }
}

export default GiveawaysCustomGiveawayCalendar;