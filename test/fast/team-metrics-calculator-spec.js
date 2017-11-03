describe("Team Metrics Calculator", function() {

    var iteration1Start = new Date(2017,06,05,0,0,0);
    var iteration1End = new Date(2017,06,18,23,59,59);
    var iteration2Start = new Date(2017,06,19,0,0,0);
    var iteration2End = new Date(2017,07,01,23,59,59);
    var iteration3Start = new Date(2017,07,02,0,0,0);
    var iteration3End = new Date(2017,07,15,23,59,59);
    var iteration4Start = new Date(2017,07,16,0,0,0);
    var iteration4End = new Date(2017,07,29,23,59,59);
    var iteration5Start = new Date(2017,07,30,0,0,0);
    var iteration5End = new Date(2017,08,12,23,59,59);
    var iteration6Start = new Date(2017,08,13,0,0,0);
    var iteration6End = new Date(2017,08,26,23,59,59);

    var projectA = {
       Name: 'Project A',
       ObjectID: 1234
    };

    var projectB = {
      Name: 'Project B',
      ObjectID: 1235
    };

    var projectC = {
      Name: 'Project C',
      ObjectID: 1236
    };

    var iterations = [
      Ext.create('mockIteration',{ ObjectID: 11, Name: 'Iteration 1', StartDate: iteration1Start, EndDate: iteration1End, Project:projectA }),
      Ext.create('mockIteration',{ ObjectID: 12, Name: 'Iteration 1', StartDate: iteration1Start, EndDate: iteration1End, Project:projectB }),
      Ext.create('mockIteration',{ ObjectID: 13, Name: 'Iteration 1', StartDate: iteration1Start, EndDate: iteration1End, Project:projectC }),
      Ext.create('mockIteration',{ ObjectID: 21, Name: 'Iteration 2', StartDate: iteration2Start, EndDate: iteration2End, Project:projectA }),
      Ext.create('mockIteration',{ ObjectID: 22, Name: 'Iteration 2', StartDate: iteration2Start, EndDate: iteration2End, Project:projectB }),
      Ext.create('mockIteration',{ ObjectID: 23, Name: 'Iteration 2', StartDate: iteration2Start, EndDate: iteration2End, Project:projectC }),
      Ext.create('mockIteration',{ ObjectID: 31, Name: 'Iteration 3', StartDate: iteration3Start, EndDate: iteration3End, Project:projectA }),
      Ext.create('mockIteration',{ ObjectID: 32, Name: 'Iteration 3', StartDate: iteration3Start, EndDate: iteration3End, Project:projectB }),
      Ext.create('mockIteration',{ ObjectID: 33, Name: 'Iteration 3', StartDate: iteration3Start, EndDate: iteration3End, Project:projectC }),
      Ext.create('mockIteration',{ ObjectID: 41, Name: 'Iteration 4', StartDate: iteration4Start, EndDate: iteration4End, Project:projectA }),
      Ext.create('mockIteration',{ ObjectID: 42, Name: 'Iteration 4', StartDate: iteration4Start, EndDate: iteration4End, Project:projectB }),
      Ext.create('mockIteration',{ ObjectID: 43, Name: 'Iteration 4', StartDate: iteration4Start, EndDate: iteration4End, Project:projectC }),
      Ext.create('mockIteration',{ ObjectID: 51, Name: 'Iteration 5', StartDate: iteration5Start, EndDate: iteration5End, Project:projectA }),
      Ext.create('mockIteration',{ ObjectID: 52, Name: 'Iteration 5', StartDate: iteration5Start, EndDate: iteration5End, Project:projectB }),
      Ext.create('mockIteration',{ ObjectID: 53, Name: 'Iteration 5', StartDate: iteration5Start, EndDate: iteration5End, Project:projectC }),
      Ext.create('mockIteration',{ ObjectID: 61, Name: 'Iteration 6', StartDate: iteration6Start, EndDate: iteration6End, Project:projectA }),
      Ext.create('mockIteration',{ ObjectID: 62, Name: 'Iteration 6', StartDate: iteration6Start, EndDate: iteration6End, Project:projectB }),
      Ext.create('mockIteration',{ ObjectID: 63, Name: 'Iteration 6', StartDate: iteration6Start, EndDate: iteration6End, Project:projectC })
    ];

    var idx = 1000;
    var snapshots = [
      Ext.create('mockSnapshot',{ ObjectID: idx++, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:1234, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
      Ext.create('mockSnapshot',{ ObjectID: idx++, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:1234, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
      Ext.create('mockSnapshot',{ ObjectID: idx++, Name: 'Story A', PlanEstimate: 6, Iteration: 11, Project:1234, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
    ];

    it("should filter out the relevant snapshots",function(){
      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project: 1234, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project: 1234, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 21, Project: 1234, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story A', PlanEstimate: 6, Iteration: 11, Project: 1234, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots
      });

      expect(Ext.Object.getKeys(calcA.snapshotsByIterationOid).length).toBe(2);
      expect(calcA.snapshotsByIterationOid["11"].length).toBe(3);
      expect(calcA.snapshotsByIterationOid["21"].length).toBe(1);

    });

    it('should filter out the relevant iterations', function() {
      var calc = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots
      });


      expect(Ext.Object.getKeys(calc.iterationByName).length).toBe(6);

      Ext.Object.each(calc.iterationByName, function(key,val){
         expect(val.Project.ObjectID).toBe(projectA.ObjectID);
      });

    });

    it("calculate number of planned and accepted points for an iteration based on a point in time represented by an offset of the iteration start date",function(){

      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:1234, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:1234, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 21, Project:1234, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story A', PlanEstimate: 6, Iteration: 11, Project:1234, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story A', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 6, Iteration: 11, Project:1234, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0
      });
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(3);

      calcA.setHoursOffsetFromIterationStart(13);
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(9);

      calcA.setHoursOffsetFromIterationStart(48);
      expect(calcA.getPlannedPoints('Iteration 1',48)).toBe(13);

      calcA.setHoursOffsetFromIterationStart(72);
      expect(calcA.getPlannedPoints('Iteration 1',72)).toBe(9);
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(6);

    });

    it('should calculate number of points accepted based on stories associated with the iteration for the given project', function() {
      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:1234, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 3, Iteration: 11, Project:1234, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '9999-12-31T23:59:59Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:1234, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', PlanEstimate: 4, Iteration: 21, Project:1234, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 4, Iteration: 21, Project:1234, _ValidFrom: '2017-07-08T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', PlanEstimate: 6, Iteration: 11, Project:1234, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 6, Iteration: 11, Project:1234, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0
      });
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(9);

    });

    it("calculate acceptance rate for planned vs acceptance for each iteration",function(){
      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:1234, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 3, Iteration: 11, Project:1234, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:1234, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', PlanEstimate: 4, Iteration: 21, Project:1234, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 4, Iteration: 21, Project:1234, _ValidFrom: '2017-07-08T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', PlanEstimate: 6, Iteration: 11, Project:1234, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 6, Iteration: 11, Project:1234, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0
      });
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(3)
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(9);
      expect(calcA.getAcceptanceRatio('Iteration 1')).toBe(3);

      calcA.setHoursOffsetFromIterationStart(72);
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(9)
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(9);
      expect(calcA.getAcceptanceRatio('Iteration 1')).toBe(1);



    });
    //
    // it('should calculate the points added after the iteraiton commit time for each iteration', function() {
    //   expect(false).toBe(true);
    // });
    //
    // it('should calculate the total number of days blocked for each iteration', function() {
    //   expect(false).toBe(true);
    // });
    //
    // it('should calculate the average time to resolve blockers for for each iteration', function() {
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate the number of defects accepted for the iteration that have a particular tag associated with them', function() {
    //   expect(false).toBe(true);
    // });
    //
    // it('should calculate PIP velocity planned for each iteration', function() {
    //   expect(false).toBe(true);
    // });
    //
    // it('should calculate PIP load planned for each iteration', function() {
    //       expect(false).toBe(true);
    // });
    //
    // it("calculate number of planned points based on a certain number of days after the iteration start date",function(){
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate number of points accepted based on stories associated with the iteration for the given project', function() {
    //     expect(false).toBe(true);
    // });
    //
    // it("calculate number of planned points based on a certain number of days after the iteration start date for the entire release",function(){
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate number of points accepted based on stories associated with the iterations for an entire release for the given project', function() {
    //     expect(false).toBe(true);
    // });
    //
    // it("calculate acceptance rate for planned vs acceptance for the entire release",function(){
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate the points added after the iteraiton commit time for the entire release', function() {
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate the total number of days blocked for the entire release', function() {
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate the average time to resolve blockers for the entire release', function() {
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate the number of defects accepted for the entire release that have a particular tag associated with them', function() {
    //   expect(false).toBe(true);
    // });
    //
    // it('should calculate PIP velocity planned for the entire release', function() {
    //     expect(false).toBe(true);
    // });
    //
    // it('should calculate PIP load planned for the entire release', function() {
    //     expect(false).toBe(true);
    // });

});
