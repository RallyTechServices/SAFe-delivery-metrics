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

    var release = {
      ReleaseStartDate: new Date(2017,06,05,0,0,0)
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
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project: projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project: projectA, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 21, Project: projectA, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story A', PlanEstimate: 6, Iteration: 11, Project: projectA, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          release: release
      });
      expect(Ext.Object.getKeys(calcA.snapshotsByIterationOid).length).toBe(2);
      expect(calcA.snapshotsByIterationOid["11"].length).toBe(3);
      expect(calcA.snapshotsByIterationOid["21"].length).toBe(1);

    });

    it('should filter out the relevant iterations', function() {
      var calc = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          release: release
      });


      expect(Ext.Object.getKeys(calc.iterationByName).length).toBe(6);

      Ext.Object.each(calc.iterationByName, function(key,val){
         expect(val.Project.ObjectID).toBe(projectA.ObjectID);
      });

    });

    it("calculate number of planned and accepted points for an iteration based on a point in time represented by an offset of the iteration start date",function(){

      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 21, Project:projectA, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story A', PlanEstimate: 6, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story A', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 6, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0,
          release: release
      });
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(3);

      calcA.setDaysOffsetFromIterationStart(0.5);
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(9);

      calcA.setDaysOffsetFromIterationStart(2);
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(13);

      calcA.setDaysOffsetFromIterationStart(3);
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(9);
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(6);

    });

    it('should calculate number of points accepted based on stories associated with the iteration for the given project', function() {
      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 3, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '9999-12-31T23:59:59Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', PlanEstimate: 4, Iteration: 21, Project:projectA, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 4, Iteration: 21, Project:projectA, _ValidFrom: '2017-07-08T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', PlanEstimate: 6, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 6, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0,
          release: release
      });
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(9);

    });

    it("calculate acceptance rate for planned vs acceptance for each iteration",function(){
      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 3, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', PlanEstimate: 4, Iteration: 21, Project:projectA, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 4, Iteration: 21, Project:projectA, _ValidFrom: '2017-07-08T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', PlanEstimate: 6, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-05T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 6, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T12:00:01Z', _ValidTo: '9999-12-31T23:59:59Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          daysOffsetFromIterationStart: 0,
          release: release
      });
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(3)
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(9);
      expect(calcA.getAcceptanceRatio('Iteration 1')).toBe(3);

      calcA.setDaysOffsetFromIterationStart(3);
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(9)
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(9);
      expect(calcA.getAcceptanceRatio('Iteration 1')).toBe(1);

      //TODO add 0 and edge cases here

    });

    it('should calculate the points added after the iteraiton commit time for each iteration', function() {
      var snapshots = [
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 3, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', PlanEstimate: 4, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T12:00:43Z', _ValidTo: '9999-07-31T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', PlanEstimate: 4, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-07T12:00:01Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', AcceptedDate: '2017-08-01T12:00:00Z', PlanEstimate: 5, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T12:00:00Z', _ValidTo: '9999-09-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', PlanEstimate: 6, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-19T12:00:43Z', _ValidTo: '2017-07-31T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', PlanEstimate: 6, Iteration: 11, Project:projectA, AcceptedDate: '2017-07-31T1:00:00Z', _ValidFrom: '2017-07-31T12:00:43Z', _ValidTo: '9999-08-30T12:00:00Z' })
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0,
          release: release
      });
      expect(calcA.getPlannedPoints('Iteration 1')).toBe(3);
      expect(calcA.getAcceptedPoints('Iteration 1')).toBe(11);
      expect(calcA.getPointsAddedAfterCommitment('Iteration 1')).toBe(8);

    });

    it('should calculate the total number of days blocked for each iteration', function() {
      var snapshots = [
        //Starts blocked, unblocked, blocked again = 1 (2-1) + 2 (3-1) = 3
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-06T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-06T12:00:43Z', _ValidTo: '2017-07-10T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-10T12:00:43Z', _ValidTo: '2017-07-12T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 1, Name: 'Story A', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-12T12:00:43Z', _ValidTo: '2017-07-31T12:00:00Z' }),

        //starts unblocked, blocked over a weekend, unblocked, blocked again = 1 (4-2-1) + 1 (4-2-1) = 2
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:01Z', _ValidTo: '2017-07-07T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-07T12:00:00Z', _ValidTo: '2017-07-10T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-10T12:00:00Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:00Z', _ValidTo: '2017-07-16T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 2, Name: 'Story B', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-16T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),

        //blocked on boundaries 1 (2-1) + 1 (2-1) = 2
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:00Z', _ValidTo: '2017-07-06T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-06T12:00:00Z', _ValidTo: '2017-07-17T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 3, Name: 'Story C', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-17T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),

        //blocked in middle 2 (3-1)
        Ext.create('mockSnapshot',{ ObjectID: 4, Name: 'Story D', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-06T12:00:00Z', _ValidTo: '2017-07-10T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 4, Name: 'Story D', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-10T12:00:00Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 4, Name: 'Story D', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),

        //blocked the entire iteration 9 days (10-1)
        Ext.create('mockSnapshot',{ ObjectID: 5, Name: 'Story E', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:00Z', _ValidTo: '2017-09-21T12:00:00Z' }),

        //blocked for partial days 0.25 + 0.25
        Ext.create('mockSnapshot',{ ObjectID: 6, Name: 'Story F', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:00Z', _ValidTo: '2017-07-05T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 6, Name: 'Story F', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-05T12:00:00Z', _ValidTo: '2017-07-05T14:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 6, Name: 'Story F', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-05T14:00:00Z', _ValidTo: '2017-07-08T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 6, Name: 'Story F', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T12:00:00Z', _ValidTo: '2017-07-08T14:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 6, Name: 'Story F', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-08T14:00:00Z', _ValidTo: '2017-07-11T12:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 6, Name: 'Story F', Blocked: true, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-11T12:00:00Z', _ValidTo: '2017-07-11T14:00:00Z' }),
        Ext.create('mockSnapshot',{ ObjectID: 6, Name: 'Story F', Blocked: false, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-11T14:00:00Z', _ValidTo: '2017-07-31T12:00:00Z' }),

      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0,
          release: release
      });
      expect(calcA.getDaysBlocked('Iteration 1')).toBe(19.5);
      expect(calcA.getAverageBlockerResolution('Iteration 1')).toBe(1.95);

    });

    // it('should calculate the average time to resolve blockers for for each iteration', function() {
    //     expect(false).toBe(true);
    //     //getAverageBlockerResolution
    // });

    it('should calculate the number of defects accepted for the iteration that have a particular tag associated with them', function() {
      var snapshots = [
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: null, Tags: [123,456], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [123], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: null, Tags: [124,456], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [124], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 3, Name: 'Defect C', AcceptedDate: null, Tags: [123,456], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-18T12:00:43Z', _ValidTo: '2017-07-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 3, Name: 'Defect C', AcceptedDate: '2017-07-21T12:00:00Z', Tags: [123], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-21T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

      ];



      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0,
          defectTag: '/tag/123,/tag/2333',
          release: release
      });
      expect(calcA.getDefectsClosedByTag('Iteration 1')).toBe(1);
      expect(calcA.getDefectsClosedByTag('Iteration 2')).toBe(1);
      expect(calcA.getDefectsClosedByTag('Iteration 3')).toBe(0);

    });

    it ('should calculate the blocked duration properly, using the desired formula',function(){
      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: [],
          snapshots: [],
          release: release
      });

      //Iteration dates: Wed 7-5-2017 through Tues 7-18-2017
      var iterationData = { StartDate: iteration1Start, EndDate: iteration1End};

      expect(calcA._getBlockedDuration({
          _ValidFrom: '2017-07-04T12:00:00Z',
          _ValidTo: '2017-07-13T12:00:00Z' },iterationData)).toBe(6);

      expect(calcA._getBlockedDuration({
            _ValidFrom: '2017-07-06T12:00:00Z',
            _ValidTo: '2017-07-06T14:00:00Z'},iterationData)).toBe(0.25);

      expect(calcA._getBlockedDuration({
            _ValidFrom: '2017-07-13T12:00:00Z',
            _ValidTo: '2017-07-20T14:00:00Z'},iterationData)).toBe(3);

      expect(calcA._getBlockedDuration({
            _ValidFrom: '2017-07-04T12:00:00Z',
            _ValidTo: '2017-07-20T14:00:00Z'},iterationData)).toBe(9);

      expect(calcA._getBlockedDuration({
            _ValidFrom: '2017-07-04T12:00:00Z',
            _ValidTo: '2017-07-20T14:00:00Z'},iterationData)).toBe(9);


    });

    it('should calculate the number of defects accepted for the iteration that have a particular tag associated with them, and it should not include stories with the tag', function() {
      var snapshots = [
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: null, Tags: [123,456], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [123], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: null, Tags: [124,456], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [124], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Requirement','HierarchicalRequirement'], ObjectID: 3, Name: 'Story C', AcceptedDate: null, Tags: [123,456], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-18T12:00:43Z', _ValidTo: '2017-07-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Requirement','HierarchicalRequirement'],  ObjectID: 3, Name: 'Story C', AcceptedDate: '2017-07-21T12:00:00Z', Tags: [123], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-21T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0,
          defectTag: '/tag/123,/tag/2333',
          release: release
      });
      expect(calcA.getDefectsClosedByTag('Iteration 1')).toBe(1);
      expect(calcA.getDefectsClosedByTag('Iteration 2')).toBe(0);
      expect(calcA.getDefectsClosedByTag('Iteration 3')).toBe(0);

    });

    it('should calculate PIP velocity planned for each iteration', function() {
      var iterationCreated = new Date(2017,02,27,0,0,0);
      var iterations = [
        Ext.create('mockIteration',{ ObjectID: 11, Name: 'Iteration 1', StartDate: iteration1Start, EndDate: iteration1End, Project:projectA, RevisionHistory: {ObjectID: 101}, PlannedVelocity: 21, CreationDate: iterationCreated })
      ],
      iterationRevisions = [
            Ext.create('mockIterationRevision',{ RevisionHistory: {ObjectID: 101}, ObjectID: 111, Description: 'PLANNED VELOCITY added [39.0 Points]', CreationDate: new Date(2017,3,1,12,0,0) }),
            Ext.create('mockIterationRevision',{ RevisionHistory: {ObjectID: 101}, ObjectID: 112, Description: 'PLANNED VELOCITY changed from [39.0 Points] to [41.0 Points]', CreationDate: new Date(2017,4,4,12,0,0) }),
            Ext.create('mockIterationRevision',{ RevisionHistory: {ObjectID: 101}, ObjectID: 113, Description: 'PLANNED VELOCITY changed from [42.0 Points] to [44.0 Points]', CreationDate: new Date(2017,5,1,12,0,0) }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          iterationRevisions: iterationRevisions,
          release: {ReleaseStartDate: new Date(2017,3,30,0,0,0)},
          daysOffsetFromPIStart: 0
      });

      expect(Number(calcA.getPIPVelocityPlanned('Iteration 1'))).toBe(39);

    });
    //TODO add the variations of iteration velocity history



    it('should calculate PIP load planned for each iteration', function() {

      var snapshots = [
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: null, Tags: [123,456], PlanEstimate: 10, Iteration: 11, Project:projectA, _ValidFrom: '2017-04-27T12:00:43Z', _ValidTo: '2017-05-01T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: null, PlanEstimate: 20, Iteration: 11, Project:projectA, _ValidFrom: '2017-05-01T12:00:43Z', _ValidTo: '2017-07-04T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: null, PlanEstimate: 30, Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [123], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: null, Tags: [124,456], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [124], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Requirement','HierarchicalRequirement'], ObjectID: 3, Name: 'Story C', AcceptedDate: null, PlanEstimate: 33, Iteration: 21, Project:projectA, _ValidFrom: '2017-03-31T12:00:43Z', _ValidTo: '2017-07-18T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Requirement','HierarchicalRequirement'], ObjectID: 3, Name: 'Story C', AcceptedDate: null, Tags: [123,456], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-18T12:00:43Z', _ValidTo: '2017-07-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Requirement','HierarchicalRequirement'],  ObjectID: 3, Name: 'Story C', AcceptedDate: '2017-07-21T12:00:00Z', Tags: [123], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-21T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          release: {ReleaseStartDate: new Date(2017,3,30,0,0,0)},
          daysOffsetFromPIStart: 0
      });
      expect(calcA.getPIPLoadPlanned('Iteration 1')).toBe(10);
          //getPIPLoadPlanned
    });

    it ('should calculate the blocked duration as expected, using the desired formula',function(){
      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: [],
          snapshots: [],
          release: release
      });

      //Iteration dates: Wed 7-5-2017 through Tues 7-18-2017
      var iterationData = { StartDate: new Date(2017,09,16,12,0,0), EndDate: new Date(2017,09,27,23,59,0)};

      expect(calcA._getBlockedDuration({
          _ValidFrom: '2017-10-18T17:02:00Z',
          _ValidTo: '2017-10-19T16:06:00Z' },iterationData)).toBe(1);

      expect(calcA._getBlockedDuration({
            _ValidFrom: '2017-10-19T15:00:00Z',
            _ValidTo: '2017-10-19T16:06:00Z'},iterationData)).toBe(0.125);

      expect(calcA._getBlockedDuration({
            _ValidFrom: '2017-10-19T17:27:00Z',
            _ValidTo: '2017-10-23T12:35:00Z'},iterationData)).toBe(2);

    });
    it('should calculate the number of defects accepted for the iteration that have a particular tag associated with them when multiple snapshots for the defect exist', function() {
      var snapshots = [
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: null, Tags: [123,456], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [123], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-15T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 1, Name: 'Defect A', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [123], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-15T12:00:00Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: null, Tags: [124,456], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-04T12:00:43Z', _ValidTo: '2017-07-13T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 2, Name: 'Defect B', AcceptedDate: '2017-07-13T12:00:00Z', Tags: [124], Iteration: 11, Project:projectA, _ValidFrom: '2017-07-13T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),

        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 3, Name: 'Defect C', AcceptedDate: null, Tags: [123,456], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-18T12:00:43Z', _ValidTo: '2017-07-21T12:00:00Z' }),
        Ext.create('mockSnapshot',{ _TypeHierarchy: ['PersistableObject','DomainObject','WorkspaceDomainObject','Artifact','SchedulableArtifact','Defect'],  ObjectID: 3, Name: 'Defect C', AcceptedDate: '2017-07-21T12:00:00Z', Tags: [123], Iteration: 21, Project:projectA, _ValidFrom: '2017-07-21T12:00:43Z', _ValidTo: '2017-08-08T12:00:00Z' }),
      ];

      var calcA = Ext.create('CArABU.app.utils.teamMetricsCalculator',{
          project: projectA,
          iterations: iterations,
          snapshots: snapshots,
          hoursOffsetFromIterationStart: 0,
          defectTag: '/tag/123,/tag/2333',
          release: release
      });
      expect(calcA.getDefectsClosedByTag('Iteration 1')).toBe(1);
      expect(calcA.getDefectsClosedByTag('Iteration 2')).toBe(1);
      expect(calcA.getDefectsClosedByTag('Iteration 3')).toBe(0);

    });

});
